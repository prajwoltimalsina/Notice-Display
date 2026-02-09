-- Create function to update timestamps if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create display_settings table for configurable content
CREATE TABLE public.display_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.display_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings (for display page)
CREATE POLICY "Anyone can read display settings" 
ON public.display_settings 
FOR SELECT 
USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can insert display settings" 
ON public.display_settings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update display settings" 
ON public.display_settings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete display settings" 
ON public.display_settings 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Insert default footer message
INSERT INTO public.display_settings (setting_key, setting_value)
VALUES ('footer_message', 'Welcome to KU');

-- Add trigger for updated_at
CREATE TRIGGER update_display_settings_updated_at
BEFORE UPDATE ON public.display_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();