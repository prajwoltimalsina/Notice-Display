-- Fix: Users Cannot Delete Their Own Profiles (GDPR compliance)

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to delete any profile for admin functionality
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));