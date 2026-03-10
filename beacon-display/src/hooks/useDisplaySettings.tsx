import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DisplaySetting {
  id: string;
  setting_key: string;
  setting_value: string;
}

export function useDisplaySettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('display_settings')
      .select('setting_key, setting_value');

    if (!error && data) {
      const settingsMap = data.reduce((acc, item) => {
        acc[item.setting_key] = item.setting_value;
        return acc;
      }, {} as Record<string, string>);
      setSettings(settingsMap);
    }
    setIsLoading(false);
  };

  const updateSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('display_settings')
      .upsert({ setting_key: key, setting_value: value }, { onConflict: 'setting_key' });

    if (!error) {
      setSettings(prev => ({ ...prev, [key]: value }));
    }
    return { error };
  };

  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key] ?? defaultValue;
  };

  return { settings, isLoading, updateSetting, getSetting, refetch: fetchSettings };
}
