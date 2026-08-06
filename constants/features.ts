/** App feature toggles — flip when a capability is ready for farmers */
export const FEATURES = {
  /** Order / cart / checkout — disabled for now (browse-only product catalog) */
  commerceEnabled: false,
  /** Chat photo upload — hidden until vision model is production-ready */
  chatImageUploadEnabled: false,
} as const;
