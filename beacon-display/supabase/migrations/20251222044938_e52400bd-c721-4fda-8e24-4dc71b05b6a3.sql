-- Drop the overly permissive policy that allows all authenticated users to see all notices
DROP POLICY IF EXISTS "Authenticated users can view all notices" ON public.notices;

-- Create a policy for admins to view all notices (they already have this via "Admins can manage notices")
-- Add explicit SELECT policy for admins for clarity
CREATE POLICY "Admins can view all notices"
  ON public.notices
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a policy for users to view their own drafts (notices they created)
CREATE POLICY "Users can view own notices"
  ON public.notices
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());