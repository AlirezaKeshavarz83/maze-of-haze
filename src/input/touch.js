const SWIPE_THRESHOLD_PX = 28;
const INTERACTIVE_SELECTOR = ".overlay, .sidebar, button, a, input, select, textarea, label";

function directionFromDelta(deltaX, deltaY) {
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX >= 0 ? "right" : "left";
  }

  return deltaY >= 0 ? "down" : "up";
}

export function setupTouch({ element, onDirection, isEnabled }) {
  let activeTouchId = null;
  let startX = 0;
  let startY = 0;
  let ignoreGesture = false;

  function resetGesture() {
    activeTouchId = null;
    ignoreGesture = false;
  }

  function activeTouchFrom(event) {
    if (activeTouchId === null) return null;
    return Array.from(event.changedTouches).find((touch) => touch.identifier === activeTouchId) ?? null;
  }

  function handleTouchStart(event) {
    if (!isEnabled()) {
      resetGesture();
      return;
    }

    if (event.touches.length !== 1) {
      resetGesture();
      return;
    }

    const touch = event.changedTouches[0];
    const target = event.target instanceof Element ? event.target : null;
    activeTouchId = touch.identifier;
    startX = touch.clientX;
    startY = touch.clientY;
    ignoreGesture = Boolean(target?.closest(INTERACTIVE_SELECTOR));

    if (!ignoreGesture) {
      event.preventDefault();
    }
  }

  function handleTouchMove(event) {
    if (!isEnabled()) {
      resetGesture();
      return;
    }

    if (event.touches.length > 1) {
      resetGesture();
      return;
    }

    if (activeTouchId !== null && !ignoreGesture) {
      event.preventDefault();
    }
  }

  function handleTouchEnd(event) {
    if (!isEnabled()) {
      resetGesture();
      return;
    }

    const touch = activeTouchFrom(event);
    if (!touch) return;

    if (!ignoreGesture) {
      event.preventDefault();

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const magnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

      if (magnitude >= SWIPE_THRESHOLD_PX) {
        onDirection(directionFromDelta(deltaX, deltaY));
      }
    }

    resetGesture();
  }

  function handleTouchCancel() {
    resetGesture();
  }

  element.addEventListener("touchstart", handleTouchStart, { passive: false });
  element.addEventListener("touchmove", handleTouchMove, { passive: false });
  element.addEventListener("touchend", handleTouchEnd, { passive: false });
  element.addEventListener("touchcancel", handleTouchCancel, { passive: true });

  return () => {
    element.removeEventListener("touchstart", handleTouchStart);
    element.removeEventListener("touchmove", handleTouchMove);
    element.removeEventListener("touchend", handleTouchEnd);
    element.removeEventListener("touchcancel", handleTouchCancel);
  };
}
