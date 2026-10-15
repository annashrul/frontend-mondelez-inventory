const properties = ['--dialog-viewport-height', '--dialog-viewport-top', '--dialog-viewport-bottom'];

// VisualViewport also changes when mobile keyboards overlay the layout viewport.
export function bindDialogViewport(content, browser = window) {
  const viewport = browser.visualViewport;
  const mobile = browser.matchMedia('(max-width: 767px)');
  let frame;
  const clear = () => properties.forEach(property => content.style.removeProperty(property));
  const update = () => {
    if (!mobile.matches) { clear(); return; }
    const height = viewport?.height ?? browser.innerHeight;
    const top = viewport?.offsetTop ?? 0;
    content.style.setProperty(properties[0], `${height}px`);
    content.style.setProperty(properties[1], `${top}px`);
    content.style.setProperty(properties[2], `${Math.max(0, browser.innerHeight - height - top)}px`);

    // Wait for the opening slide to finish before measuring focused fields.
    if (content.getAnimations?.().some(animation => animation.playState === 'running' && animation.effect?.target === content)) return;
    const focused = browser.document.activeElement;
    if (!focused || !content.contains(focused) || !focused.matches('input, textarea, select, [contenteditable="true"]')) return;
    const scroller = focused.closest('[data-modal-scroll]') || content;
    const bounds = scroller.getBoundingClientRect();
    const field = focused.getBoundingClientRect();
    const footer = scroller.querySelector('[data-modal-footer], form > div:last-child');
    const footerTop = footer && !footer.contains(focused) && browser.getComputedStyle(footer).position === 'sticky'
      ? footer.getBoundingClientRect().top : Infinity;
    const visibleTop = Math.max(bounds.top, top) + 12;
    const visibleBottom = Math.min(bounds.bottom, top + height, footerTop) - 12;
    if (field.bottom > visibleBottom) scroller.scrollTop += field.bottom - visibleBottom;
    else if (field.top < visibleTop) scroller.scrollTop -= visibleTop - field.top;
  };
  const schedule = () => {
    browser.cancelAnimationFrame(frame);
    frame = browser.requestAnimationFrame(update);
  };
  update();
  viewport?.addEventListener('resize', schedule);
  viewport?.addEventListener('scroll', schedule);
  browser.addEventListener('resize', schedule);
  mobile.addEventListener('change', schedule);
  content.addEventListener('focusin', schedule);
  content.addEventListener('animationend', schedule);
  return () => {
    browser.cancelAnimationFrame(frame);
    viewport?.removeEventListener('resize', schedule);
    viewport?.removeEventListener('scroll', schedule);
    browser.removeEventListener('resize', schedule);
    mobile.removeEventListener('change', schedule);
    content.removeEventListener('focusin', schedule);
    content.removeEventListener('animationend', schedule);
    clear();
  };
}
