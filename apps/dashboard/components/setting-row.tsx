import { updateSetting } from "@/app/app/actions";

export function SettingRow({ label, description, settingKey, enabled }: { label: string; description: string; settingKey: "default_tracking"|"open_notifications"; enabled: boolean }) {
  return <div className="setting-row"><div><h3>{label}</h3><p>{description}</p></div><form action={updateSetting}><input type="hidden" name="key" value={settingKey}/><input type="hidden" name="value" value={String(!enabled)}/><button className={`switch ${enabled?"on":""}`} type="submit" role="switch" aria-checked={enabled} aria-label={`${label}: ${enabled?"on":"off"}`}><span/></button></form></div>;
}
