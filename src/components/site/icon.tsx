import {
  Activity,
  Award,
  AudioWaveform,
  ClipboardList,
  Drama,
  Globe,
  Globe2,
  HeartPulse,
  Landmark,
  MicVocal,
  Microscope,
  Repeat,
  Route,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

/** Set curado (estilo light/thin) para no arrastrar toda la librería al bundle. */
const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  award: Award,
  "audio-waveform": AudioWaveform,
  "clipboard-list": ClipboardList,
  drama: Drama,
  globe: Globe,
  "globe-2": Globe2,
  "heart-pulse": HeartPulse,
  landmark: Landmark,
  "mic-vocal": MicVocal,
  microscope: Microscope,
  repeat: Repeat,
  route: Route,
  stethoscope: Stethoscope,
};

export const ICON_NAMES = Object.keys(ICONS);

export function Icon({
  name,
  className = "size-5",
  fallback = true,
}: {
  name?: string | null;
  className?: string;
  fallback?: boolean;
}) {
  const Cmp = (name && ICONS[name]) || (fallback ? AudioWaveform : null);
  if (!Cmp) return null;
  return <Cmp className={className} strokeWidth={1.5} aria-hidden="true" />;
}
