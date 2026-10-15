import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Languages, LogOut, Moon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useSettingsStore } from '@/stores/settingsStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function ProfilePreferences({ user, onLogout }) {
  const { t } = useTranslation();
  const theme = useSettingsStore(state => state.settings.tema);
  const language = useSettingsStore(state => state.settings.bahasa);
  const setPreferences = useSettingsStore(state => state.setAppearancePreferences);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef();
  const openedByHover = useRef(false);
  const contentRef = useRef(null);
  const triggerRef = useRef(null);
  const id = useId();

  useEffect(() => () => clearTimeout(closeTimer.current), []);
  const cancelClose = () => clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      if (!contentRef.current?.contains(document.activeElement)) setOpen(false);
    }, 180);
  };
  const hoverOpen = event => {
    if (event.pointerType !== 'mouse') return;
    cancelClose();
    openedByHover.current = true;
    setOpen(true);
  };

  return (
    <Popover open={open} onOpenChange={value => { cancelClose(); setOpen(value); }}>
      <PopoverTrigger asChild>
        <Button ref={triggerRef} type="button" variant="ghost" className="h-auto gap-2 px-2 py-1.5" aria-label={t('Preferensi profil')}
          onPointerEnter={hoverOpen} onPointerLeave={scheduleClose} onClick={() => { openedByHover.current = false; }}>
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">{user?.nama?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm font-medium">{user?.nama || t('Pengguna')}</span>
            <span className="block text-xs text-muted-foreground">{user?.level_detail?.nama || user?.level || t('Administrator')}</span>
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent ref={contentRef} align="end" className="w-72 space-y-4 no-print"
        onPointerEnter={cancelClose} onPointerLeave={scheduleClose} onBlur={scheduleClose}
        onOpenAutoFocus={event => { if (openedByHover.current) event.preventDefault(); }}
        onCloseAutoFocus={event => { if (openedByHover.current) event.preventDefault(); }}>
        <p className="text-sm font-semibold">{t('Tampilan')}</p>
        <div className="flex items-center justify-between gap-4">
          <label htmlFor={`${id}-language`} className="flex cursor-pointer items-center gap-3">
            <Languages className="size-4 text-muted-foreground" />
            <span><span className="block text-sm font-medium">{t('Bahasa')}</span><span className="block text-xs text-muted-foreground">{t(language === 'en' ? 'Bahasa Inggris' : 'Bahasa Indonesia')}</span></span>
          </label>
          <Switch id={`${id}-language`} checked={language === 'en'} onCheckedChange={checked => setPreferences({ bahasa: checked ? 'en' : 'id' })} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <label htmlFor={`${id}-theme`} className="flex cursor-pointer items-center gap-3">
            <Moon className="size-4 text-muted-foreground" />
            <span><span className="block text-sm font-medium">{t('Tema')}</span><span className="block text-xs text-muted-foreground">{t(theme === 'dark' ? 'Gelap' : 'Terang')}</span></span>
          </label>
          <Switch id={`${id}-theme`} checked={theme === 'dark'} onCheckedChange={checked => setPreferences({ tema: checked ? 'dark' : 'light' })} />
        </div>
        <div className="border-t pt-3">
          <Button type="button" variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive" onClick={() => {
            cancelClose();
            setOpen(false);
            onLogout?.();
          }}>
            <LogOut className="size-4" />{t('Logout')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
