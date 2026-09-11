/** Avoids circular imports between api client and userStore. */
type AuthFailureHandler = () => void | Promise<void>;

let authFailureHandler: AuthFailureHandler | null = null;
let clearing = false;

export function registerAuthFailureHandler(handler: AuthFailureHandler): void {
  authFailureHandler = handler;
}

export function notifyAuthFailure(): void {
  if (clearing) return;
  clearing = true;
  Promise.resolve(authFailureHandler?.())
    .catch(() => undefined)
    .finally(() => {
      clearing = false;
    });
}
