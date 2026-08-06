import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { InteractionManager, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui';
import { Body, Caption, Label } from '@/components/ui/Typography';
import { FieldMeasureMap } from '@/features/crop/components/FieldMeasureMap';
import {
  captureFieldCorner,
  formatAccuracyHint,
  isWalkLoopClosed,
  simplifyWalkPoints,
  startFieldWalkTracking,
  validateCornerPoints,
  walkLoopGapMeters,
  type CaptureProgress,
  type GpsQuality,
  type WalkTrackProgress,
  type WalkTrackSession,
} from '@/services/location/fieldMeasureService';
import type { FieldCorner, FieldMeasurement } from '@/types/fieldMeasure';
import type { Coordinates } from '@/types/location';
import { formatAreaDisplay, measurePolygon } from '@/utils/geoArea';
import { colors, radius, spacing } from '@/theme';

interface FieldGpsMeasureProps {
  initialPoints?: FieldCorner[];
  onApply: (measurement: FieldMeasurement) => void;
}

function qualityLabel(quality: GpsQuality): string {
  if (quality === 'good') return '±1–2m bagundi ✓';
  if (quality === 'ok') return '±2–3m ok';
  return 'GPS weak';
}

function qualityColor(quality: GpsQuality): string {
  if (quality === 'good') return colors.success;
  if (quality === 'ok') return colors.warning;
  return colors.error;
}

export function FieldGpsMeasure({ initialPoints = [], onApply }: FieldGpsMeasureProps) {
  const [mode, setMode] = useState<'walk' | 'corner'>('corner');
  const [points, setPoints] = useState<FieldCorner[]>(initialPoints);
  const [capturing, setCapturing] = useState(false);
  const [walking, setWalking] = useState(false);
  const [captureStep, setCaptureStep] = useState('');
  const [walkProgress, setWalkProgress] = useState<WalkTrackProgress | null>(null);
  const [livePosition, setLivePosition] = useState<Coordinates | null>(null);
  const [liveAccuracy, setLiveAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const walkSessionRef = useRef<WalkTrackSession | null>(null);
  const lastLiveUpdateRef = useRef(0);
  const pointsRef = useRef<FieldCorner[]>(initialPoints);
  const LIVE_MAP_UPDATE_MS = 1000;

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  useEffect(() => {
    return () => {
      walkSessionRef.current?.stop();
    };
  }, []);

  const avgAccuracy = useMemo(() => {
    const acc = points.map((p) => p.accuracyMeters).filter((v): v is number => v != null);
    if (!acc.length) return 0;
    return acc.reduce((a, b) => a + b, 0) / acc.length;
  }, [points]);

  const measurePoints = useMemo(() => {
    if (mode === 'walk' && points.length >= 3) {
      return simplifyWalkPoints(points as Coordinates[]);
    }
    return points as Coordinates[];
  }, [mode, points]);

  const loopClosed = mode === 'walk' ? isWalkLoopClosed(measurePoints) : points.length >= 3;
  const loopGapM = mode === 'walk' ? walkLoopGapMeters(measurePoints) : 0;

  const measurement = useMemo(() => {
    if (measurePoints.length < 3 || !loopClosed) return null;
    const result = measurePolygon(measurePoints, avgAccuracy);
    return {
      points,
      ...result,
      measuredAt: new Date().toISOString(),
    } satisfies FieldMeasurement;
  }, [measurePoints, avgAccuracy, loopClosed, points]);

  const addCorner = async () => {
    setCapturing(true);
    setError(null);
    setLiveAccuracy(null);
    setCaptureStep('GPS warm-up — polam moola lo nilchondi, phone open sky chudali (~15 sec)');

    const onProgress = (p: CaptureProgress) => {
      setCaptureStep(p.message);
      setLiveAccuracy(p.bestAccuracyMeters);
    };

    try {
      const corner = await captureFieldCorner(onProgress);
      const validationError = validateCornerPoints(points, corner);
      if (validationError) {
        setError(validationError);
        return;
      }

      const fieldCorner: FieldCorner = {
        latitude: corner.latitude,
        longitude: corner.longitude,
        accuracyMeters: corner.accuracyMeters,
        quality: corner.quality,
        sampleCount: corner.sampleCount,
      };
      setPoints((prev) => [...prev, fieldCorner]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GPS capture failed');
    } finally {
      setCapturing(false);
      setCaptureStep('');
      setLiveAccuracy(null);
    }
  };

  const startWalk = async () => {
    setError(null);
    setWalkProgress(null);
    setLivePosition(null);
    lastLiveUpdateRef.current = 0;
    setPoints([]);

    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      setLivePosition({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch {
      setError('GPS location raaledu — Location ON unda chudandi');
      return;
    }

    try {
      const session = await startFieldWalkTracking(
        (corner) => {
          const fieldCorner: FieldCorner = {
            latitude: corner.latitude,
            longitude: corner.longitude,
            accuracyMeters: corner.accuracyMeters,
            quality: corner.quality,
            sampleCount: corner.sampleCount,
          };
          setPoints((prev) => [...prev, fieldCorner]);
          setLivePosition({
            latitude: corner.latitude,
            longitude: corner.longitude,
          });
          lastLiveUpdateRef.current = Date.now();
        },
        (progress) => {
          setWalkProgress(progress);
          if (progress.liveLatitude != null && progress.liveLongitude != null) {
            const now = Date.now();
            if (now - lastLiveUpdateRef.current >= LIVE_MAP_UPDATE_MS) {
              lastLiveUpdateRef.current = now;
              setLivePosition({
                latitude: progress.liveLatitude,
                longitude: progress.liveLongitude,
              });
            }
          }
        },
        [],
        (position) => setLivePosition(position),
      );
      walkSessionRef.current = session;
      setWalking(true);
    } catch (err) {
      setWalking(false);
      setLivePosition(null);
      setError(err instanceof Error ? err.message : 'Walk tracking start avvaledu');
    }
  };

  const stopWalk = () => {
    const session = walkSessionRef.current;
    walkSessionRef.current = null;
    session?.stop();

    setWalking(false);
    setWalkProgress(null);
    setLivePosition(null);

    InteractionManager.runAfterInteractions(() => {
      const currentPoints = pointsRef.current;
      const simplified = simplifyWalkPoints(currentPoints as Coordinates[]);

      if (simplified.length < 3) {
        setError('Polam chuttu polamaina tiragali — inka konni steps tirigi malli try cheyandi');
        return;
      }

      const gap = walkLoopGapMeters(simplified);
      if (gap > 15) {
        setError(
          `Start point daggaraki tiragali — ippudu ${Math.round(gap)}m dooram undi. Polam chuttu complete chesi start daggaraki vachi Stop nokki.`,
        );
      } else {
        setError(null);
      }
    });
  };

  const switchMode = (next: 'walk' | 'corner') => {
    if (walking || capturing) return;
    if (next === 'walk') {
      walkSessionRef.current?.stop();
      walkSessionRef.current = null;
      setWalking(false);
      setWalkProgress(null);
      setLivePosition(null);
      setPoints([]);
    }
    setMode(next);
    setError(null);
    setWalkProgress(null);
  };

  const undoCorner = () => {
    setPoints((prev) => prev.slice(0, -1));
    setError(null);
  };

  const clearCorners = () => {
    walkSessionRef.current?.stop();
    walkSessionRef.current = null;
    setWalking(false);
    setWalkProgress(null);
    setLivePosition(null);
    setPoints([]);
    setError(null);
  };

  const applyMeasurement = () => {
    if (!measurement) return;
    onApply(measurement);
  };

  const areaDisplay = measurement
    ? formatAreaDisplay(measurement.areaAcres, measurement.areaCents, 'gps')
    : null;

  /** Walk lo map mount cheyakunda — Android APK crash fix. Map only corner mode or walk aipoyaka. */
  const showMap = mode === 'corner' || (mode === 'walk' && !walking && points.length > 0);

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="vector-polygon" size={20} color={colors.primary} />
        <Label style={styles.title}>📍 GPS polam measure</Label>
      </View>

      <View style={styles.modeRow}>
        <Pressable
          onPress={() => switchMode('walk')}
          disabled={walking || capturing}
          style={[styles.modeChip, mode === 'walk' && styles.modeChipActive]}
        >
          <MaterialCommunityIcons
            name="walk"
            size={18}
            color={mode === 'walk' ? colors.surface : colors.primary}
          />
          <Caption style={[styles.modeChipText, mode === 'walk' && styles.modeChipTextActive]}>
            Tiragandi
          </Caption>
        </Pressable>
        <Pressable
          onPress={() => switchMode('corner')}
          disabled={walking || capturing}
          style={[styles.modeChip, mode === 'corner' && styles.modeChipActive]}
        >
          <MaterialCommunityIcons
            name="map-marker-plus"
            size={18}
            color={mode === 'corner' ? colors.surface : colors.primary}
          />
          <Caption style={[styles.modeChipText, mode === 'corner' && styles.modeChipTextActive]}>
            Moolalu pin ★
          </Caption>
        </Pressable>
      </View>

      <Caption style={styles.help}>
        {mode === 'walk'
          ? 'Polam border chuttu tirigi start point daggariki vachaka Stop nokki. Loop complete kaakapothe area wrong vastundi.'
          : 'Open sky lo prati moola daggar 15 sec nilchondi, “add” nokki — idi kante exact. Chinna polam ki tape/patta measure best.'}
      </Caption>

      {mode === 'walk' && walking ? (
        <View style={styles.walkGpsBox}>
          <MaterialCommunityIcons name="crosshairs-gps" size={28} color={colors.primary} />
          <Caption style={styles.walkGpsTitle}>GPS recording — polam chuttu tiragandi</Caption>
          <Caption style={styles.walkGpsHint}>
            Map walk aipoyaka chupistundi. Ippudu GPS tho path record avutundi.
          </Caption>
          {livePosition ? (
            <Caption style={styles.walkGpsCoords}>
              {livePosition.latitude.toFixed(5)}, {livePosition.longitude.toFixed(5)}
            </Caption>
          ) : null}
        </View>
      ) : null}

      <FieldMeasureMap
        enabled={showMap}
        points={points}
        livePosition={livePosition}
        walking={false}
      />

      {walking && walkProgress ? (
        <View style={[styles.captureBox, walkProgress.nearStart && styles.captureBoxNearStart]}>
          <Caption style={styles.captureText}>{walkProgress.message}</Caption>
          <Caption style={styles.liveAccuracy}>
            {walkProgress.pointCount} points · {walkProgress.distanceWalkedM}m tirigaru
            {walkProgress.currentAccuracyM != null
              ? ` · ±${Math.round(walkProgress.currentAccuracyM)}m`
              : ''}
          </Caption>
        </View>
      ) : null}

      {mode === 'corner' && capturing && captureStep ? (
        <View style={styles.captureBox}>
          <Caption style={styles.captureText}>{captureStep}</Caption>
          {liveAccuracy != null ? (
            <Caption style={styles.liveAccuracy}>
              Best signal: ±{Math.round(liveAccuracy * 10) / 10}m
              {liveAccuracy <= 3 ? ' ✓' : liveAccuracy <= 5 ? ' — inka wait cheyandi' : ' — weak'}
            </Caption>
          ) : null}
        </View>
      ) : null}

      {points.length > 0 ? (
        <View style={styles.pointsBox}>
          <Caption style={styles.pointsSummary}>
            {mode === 'walk'
              ? `${points.length} GPS points record ayyayi`
              : `${points.length} moolalu`}
          </Caption>
          {mode === 'corner'
            ? points.map((point, index) => (
                <View key={`${point.latitude}-${point.longitude}-${index}`} style={styles.pointRow}>
                  <View style={styles.pointHeader}>
                    <Caption style={styles.pointLabel}>Moola {index + 1}</Caption>
                    {point.quality ? (
                      <Caption style={[styles.qualityTag, { color: qualityColor(point.quality) }]}>
                        {qualityLabel(point.quality)}
                      </Caption>
                    ) : null}
                  </View>
                  <Caption style={styles.pointCoords}>
                    {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                    {point.accuracyMeters != null
                      ? ` · ${formatAccuracyHint(point.accuracyMeters)}`
                      : ''}
                  </Caption>
                </View>
              ))
            : null}
        </View>
      ) : null}

      {areaDisplay ? (
        <View style={styles.resultBox}>
          <Body style={styles.resultTitle}>GPS estimate / సుమారు విస్తీర్ణం</Body>
          <Caption style={styles.estimateBadge}>{areaDisplay.badge}</Caption>
          <Body style={styles.resultCents}>{areaDisplay.primary}</Body>
          <Caption style={styles.resultAcres}>{areaDisplay.secondary}</Caption>
          {measurement ? (
            <Caption style={styles.resultSub}>
              {Math.round(measurement.areaSqMeters)} sq.m ·{' '}
              {mode === 'walk' ? `${points.length} walk points` : `${points.length} moolalu`}
            </Caption>
          ) : null}
          {measurement && measurement.uncertaintyPercent > 5 ? (
            <Caption style={styles.uncertainty}>
              Approx ±{measurement.uncertaintyPercent}% (GPS signal batti)
            </Caption>
          ) : null}
        </View>
      ) : points.length > 0 && mode === 'corner' ? (
        <Caption style={styles.hint}>Inka {3 - points.length} moola add cheyandi area kanipinchadaniki</Caption>
      ) : points.length >= 3 && mode === 'walk' && !loopClosed && !walking ? (
        <Caption style={styles.hint}>
          Start point daggaraki {Math.round(loopGapM)}m undi — polam chuttu complete cheyandi, lekapothe area tappu
          vastundi
        </Caption>
      ) : null}

      {error ? <Caption style={styles.error}>{error}</Caption> : null}

      <View style={styles.actions}>
        {mode === 'walk' ? (
          walking ? (
            <Button
              label="Stop — polam chuttu aipoyindi"
              onPress={stopWalk}
              fullWidth
              size="md"
            />
          ) : (
            <Button
              label="Polam chuttu tiragadam start"
              onPress={() => void startWalk()}
              fullWidth
              size="md"
            />
          )
        ) : (
          <Button
            label={capturing ? 'GPS reading...' : `మూలం ${points.length + 1} add cheyandi`}
            onPress={() => void addCorner()}
            loading={capturing}
            fullWidth
            size="md"
          />
        )}
        <View style={styles.secondaryRow}>
          <Pressable
            onPress={undoCorner}
            disabled={!points.length || capturing || walking}
            style={[styles.secondaryBtn, (!points.length || walking) && styles.secondaryBtnDisabled]}
          >
            <Caption style={styles.secondaryText}>Undo</Caption>
          </Pressable>
          <Pressable
            onPress={clearCorners}
            disabled={!points.length || capturing || walking}
            style={[styles.secondaryBtn, (!points.length || walking) && styles.secondaryBtnDisabled]}
          >
            <Caption style={styles.secondaryText}>Clear</Caption>
          </Pressable>
        </View>
        {measurement ? (
          <Button
            label="Use GPS size / Ee size use cheyandi"
            onPress={applyMeasurement}
            fullWidth
            size="md"
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: `${colors.primary}08`,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}25`,
    padding: spacing.md,
    gap: spacing.sm,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { color: colors.primary, flex: 1 },
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeChipText: { fontFamily: 'Poppins_600SemiBold', color: colors.primary },
  modeChipTextActive: { color: colors.surface },
  help: { color: colors.textSecondary, lineHeight: 20 },
  walkGpsBox: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}10`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  walkGpsTitle: {
    fontFamily: 'Poppins_600SemiBold',
    color: colors.primary,
    textAlign: 'center',
  },
  walkGpsHint: { color: colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  walkGpsCoords: { color: colors.textTertiary, fontSize: 11 },
  captureBox: {
    backgroundColor: `${colors.info}15`,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  captureBoxNearStart: { backgroundColor: `${colors.success}18` },
  captureText: { color: colors.info, lineHeight: 18 },
  liveAccuracy: {
    color: colors.primary,
    fontFamily: 'Poppins_600SemiBold',
    marginTop: spacing.xxs,
  },
  pointsBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  pointsSummary: { fontFamily: 'Poppins_600SemiBold', color: colors.textSecondary },
  pointRow: { gap: 2 },
  pointHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pointLabel: { fontFamily: 'Poppins_600SemiBold', color: colors.textPrimary },
  qualityTag: { fontSize: 10, fontFamily: 'Poppins_600SemiBold' },
  pointCoords: { color: colors.textTertiary, fontSize: 11 },
  resultBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  resultTitle: { color: colors.textSecondary, fontSize: 13 },
  estimateBadge: { color: colors.warning, fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  resultCents: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: colors.primary, textAlign: 'center' },
  resultAcres: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  resultSub: { color: colors.textTertiary, marginTop: spacing.xxs },
  uncertainty: { color: colors.warning, textAlign: 'center', lineHeight: 16, marginTop: spacing.xs },
  hint: { color: colors.textTertiary, fontStyle: 'italic' },
  error: { color: colors.error, lineHeight: 18 },
  actions: { gap: spacing.sm, marginTop: spacing.xs },
  secondaryRow: { flexDirection: 'row', gap: spacing.sm },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryBtnDisabled: { opacity: 0.45 },
  secondaryText: { fontFamily: 'Poppins_500Medium' },
});
