import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui';
import { Body, Caption, Label } from '@/components/ui/Typography';
import { FieldMeasureMap } from '@/features/crop/components/FieldMeasureMap';
import {
  captureFieldCorner,
  formatAccuracyHint,
  isWalkLoopClosed,
  simplifyWalkPoints,
  validateCornerPoints,
  walkLoopGapMeters,
  type CaptureProgress,
  type GpsQuality,
  type WalkTrackProgress,
  type WalkTrackSession,
} from '@/services/location/fieldMeasureService';
import { startFieldWalkTracking } from '@/services/location/fieldWalkTracking';
import type { FieldCorner, FieldMeasurement } from '@/types/fieldMeasure';
import type { Coordinates } from '@/types/location';
import { formatAreaDisplay, measurePolygon } from '@/utils/geoArea';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, radius, spacing } from '@/theme';

interface FieldGpsMeasureProps {
  initialPoints?: FieldCorner[];
  onApply: (measurement: FieldMeasurement) => void;
}

function qualityLabel(quality: GpsQuality, fm: ReturnType<typeof useTranslation>['fm']): string {
  if (quality === 'good') return fm.qualityGood;
  if (quality === 'ok') return fm.qualityOk;
  return fm.qualityPoor;
}

function qualityColor(quality: GpsQuality): string {
  if (quality === 'good') return colors.success;
  if (quality === 'ok') return colors.warning;
  return colors.error;
}

export function FieldGpsMeasure({ initialPoints = [], onApply }: FieldGpsMeasureProps) {
  const { fm, language } = useTranslation();
  const [mode, setMode] = useState<'walk' | 'corner'>('corner');
  const [points, setPoints] = useState<FieldCorner[]>(initialPoints);
  const [capturing, setCapturing] = useState(false);
  const [walking, setWalking] = useState(false);
  const [captureStep, setCaptureStep] = useState('');
  const [walkProgress, setWalkProgress] = useState<WalkTrackProgress | null>(null);
  const [liveAccuracy, setLiveAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWalkMap, setShowWalkMap] = useState(false);
  const walkSessionRef = useRef<WalkTrackSession | null>(null);

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
    setCaptureStep(fm.cornerCaptureStart);

    const onProgress = (p: CaptureProgress) => {
      setCaptureStep(p.message);
      setLiveAccuracy(p.bestAccuracyMeters);
    };

    try {
      const corner = await captureFieldCorner(onProgress);
      const validationError = validateCornerPoints(points, corner, language);
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
    setWalking(true);
    setWalkProgress(null);
    setShowWalkMap(false);
    setPoints([]);

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
        },
        (progress) => {
          setWalkProgress(progress);
        },
        [],
        language,
      );
      walkSessionRef.current = session;
    } catch (err) {
      setWalking(false);
      setError(err instanceof Error ? err.message : fm.walkStartFailed);
    }
  };

  const stopWalk = () => {
    walkSessionRef.current?.stop();
    walkSessionRef.current = null;
    setWalking(false);
    setWalkProgress(null);
    setShowWalkMap(true);

    const simplified = simplifyWalkPoints(points as Coordinates[]);
    if (simplified.length < 3) {
      setError(fm.walkTooFewPoints);
      return;
    }

    const gap = walkLoopGapMeters(simplified);
    if (gap > 15) {
      setError(fm.walkLoopGap(Math.round(gap)));
    }
  };

  const switchMode = (next: 'walk' | 'corner') => {
    if (walking || capturing) return;
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
    setShowWalkMap(false);
    setWalkProgress(null);
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

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="vector-polygon" size={20} color={colors.primary} />
        <Label style={styles.title}>{fm.title}</Label>
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
            {fm.modeWalk}
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
            {fm.modeCorner}
          </Caption>
        </Pressable>
      </View>

      <Caption style={styles.help}>
        {mode === 'walk' ? fm.helpWalk : fm.helpCorner}
      </Caption>

      {mode === 'walk' && walking && !points.length ? (
        <Caption style={styles.mapWaiting}>{fm.mapWaiting}</Caption>
      ) : null}

      {(mode !== 'walk' || (!walking && (showWalkMap || points.length > 0))) ? (
        <FieldMeasureMap
          points={points}
          livePosition={null}
          walking={false}
        />
      ) : null}

      {walking && walkProgress ? (
        <View style={[styles.captureBox, walkProgress.nearStart && styles.captureBoxNearStart]}>
          <Caption style={styles.captureText}>{walkProgress.message}</Caption>
          <Caption style={styles.liveAccuracy}>
            {fm.walkProgressMeta(
              walkProgress.pointCount,
              walkProgress.distanceWalkedM,
              walkProgress.currentAccuracyM ?? undefined,
            )}
          </Caption>
        </View>
      ) : null}

      {mode === 'corner' && capturing && captureStep ? (
        <View style={styles.captureBox}>
          <Caption style={styles.captureText}>{captureStep}</Caption>
          {liveAccuracy != null ? (
            <Caption style={styles.liveAccuracy}>
              {fm.bestSignal} ±{Math.round(liveAccuracy * 10) / 10}m
              {liveAccuracy <= 3 ? ' ✓' : liveAccuracy <= 5 ? fm.bestSignalWait : fm.bestSignalWeak}
            </Caption>
          ) : null}
        </View>
      ) : null}

      {points.length > 0 ? (
        <View style={styles.pointsBox}>
          <Caption style={styles.pointsSummary}>
            {mode === 'walk' ? fm.pointsWalk(points.length) : fm.pointsCorner(points.length)}
          </Caption>
          {mode === 'corner'
            ? points.map((point, index) => (
                <View key={`${point.latitude}-${point.longitude}-${index}`} style={styles.pointRow}>
                  <View style={styles.pointHeader}>
                    <Caption style={styles.pointLabel}>{fm.cornerLabel(index + 1)}</Caption>
                    {point.quality ? (
                      <Caption style={[styles.qualityTag, { color: qualityColor(point.quality) }]}>
                        {qualityLabel(point.quality, fm)}
                      </Caption>
                    ) : null}
                  </View>
                  <Caption style={styles.pointCoords}>
                    {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                    {point.accuracyMeters != null
                      ? ` · ${formatAccuracyHint(point.accuracyMeters, undefined, language)}`
                      : ''}
                  </Caption>
                </View>
              ))
            : null}
        </View>
      ) : null}

      {areaDisplay ? (
        <View style={styles.resultBox}>
          <Body style={styles.resultTitle}>{fm.resultTitle}</Body>
          <Caption style={styles.estimateBadge}>{areaDisplay.badge}</Caption>
          <Body style={styles.resultCents}>{areaDisplay.primary}</Body>
          <Caption style={styles.resultAcres}>{areaDisplay.secondary}</Caption>
          {measurement ? (
            <Caption style={styles.resultSub}>
              {mode === 'walk'
                ? fm.resultSubWalk(points.length, measurement.areaSqMeters)
                : fm.resultSubCorner(points.length, measurement.areaSqMeters)}
            </Caption>
          ) : null}
          {measurement && measurement.uncertaintyPercent > 5 ? (
            <Caption style={styles.uncertainty}>
              {fm.uncertainty(measurement.uncertaintyPercent)}
            </Caption>
          ) : null}
        </View>
      ) : points.length > 0 && mode === 'corner' ? (
        <Caption style={styles.hint}>{fm.hintNeedCorners(3 - points.length)}</Caption>
      ) : points.length >= 3 && mode === 'walk' && !loopClosed && !walking ? (
        <Caption style={styles.hint}>
          {fm.hintLoopGap(Math.round(loopGapM))}
        </Caption>
      ) : null}

      {error ? <Caption style={styles.error}>{error}</Caption> : null}

      <View style={styles.actions}>
        {mode === 'walk' ? (
          walking ? (
            <Button
              label={fm.btnStopWalk}
              onPress={stopWalk}
              fullWidth
              size="md"
            />
          ) : (
            <Button
              label={fm.btnStartWalk}
              onPress={() => void startWalk()}
              fullWidth
              size="md"
            />
          )
        ) : (
          <Button
            label={capturing ? fm.btnAddCornerLoading : fm.btnAddCorner(points.length + 1)}
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
            <Caption style={styles.secondaryText}>{fm.undo}</Caption>
          </Pressable>
          <Pressable
            onPress={clearCorners}
            disabled={!points.length || capturing || walking}
            style={[styles.secondaryBtn, (!points.length || walking) && styles.secondaryBtnDisabled]}
          >
            <Caption style={styles.secondaryText}>{fm.clear}</Caption>
          </Pressable>
        </View>
        {measurement ? (
          <Button
            label={fm.btnUseSize}
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
  mapWaiting: {
    textAlign: 'center',
    color: colors.info,
    fontFamily: 'Poppins_600SemiBold',
  },
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
