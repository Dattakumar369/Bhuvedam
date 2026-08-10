/** App feature toggles — flip when a capability is ready for farmers */
export const FEATURES = {
  /** Order / cart / checkout — disabled for now (browse-only product catalog) */
  commerceEnabled: false,
  /** Chat photo scan — crop/pest/disease analysis via AI vision */
  chatImageUploadEnabled: true,
} as const;
