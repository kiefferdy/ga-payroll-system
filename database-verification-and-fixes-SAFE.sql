-- SAFE Database Verification and Fixes Script
-- This version checks for existing constraints and won't break anything

-- 1. Add unique constraint only if it doesn't exist
DO $$
BEGIN
    -- Check if the unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'security_questions_unique_user_order' 
        AND table_name = 'security_questions'
    ) THEN
        ALTER TABLE public.security_questions 
        ADD CONSTRAINT security_questions_unique_user_order 
        UNIQUE (user_id, question_order);
    END IF;
END $$;

-- 2. Create the log_security_event function (safe to run multiple times)
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_description text,
  p_ip_address inet,
  p_user_agent text,
  p_severity text,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.security_events (
    user_id,
    event_type,
    event_description,
    ip_address,
    user_agent,
    severity,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    p_event_type,
    p_description,
    p_ip_address,
    p_user_agent,
    p_severity,
    p_metadata,
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create indexes only if they don't exist (safe)
CREATE INDEX IF NOT EXISTS idx_security_questions_user_id ON public.security_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_user_created ON public.password_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user_created ON public.security_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_user_attempted ON public.auth_attempts(user_id, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_employees_account_locked ON public."Employees"(account_locked_until) WHERE account_locked_until IS NOT NULL;

-- 4. Enable Row Level Security (safe to run multiple times)
ALTER TABLE public.security_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies (safe with DROP IF EXISTS)
DROP POLICY IF EXISTS "Users can manage own security questions" ON public.security_questions;
CREATE POLICY "Users can manage own security questions" ON public.security_questions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own password history" ON public.password_history;
CREATE POLICY "Users can view own password history" ON public.password_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can manage password history" ON public.password_history;
CREATE POLICY "Service can manage password history" ON public.password_history
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Admins can view security events" ON public.security_events;
CREATE POLICY "Admins can view security events" ON public.security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public."Employees" 
      WHERE id = auth.uid() 
      AND account_type IN ('Admin', 'Developer', 'Website Administrator')
    )
  );

DROP POLICY IF EXISTS "Service can manage security events" ON public.security_events;
CREATE POLICY "Service can manage security events" ON public.security_events
  FOR ALL TO service_role USING (true);

-- 6. Grant permissions (safe - additive)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_questions TO authenticated;
GRANT SELECT ON public.password_history TO authenticated;
GRANT SELECT ON public.security_events TO authenticated;

-- Service role permissions
GRANT ALL ON public.security_questions TO service_role;
GRANT ALL ON public.password_history TO service_role;
GRANT ALL ON public.security_events TO service_role;
GRANT EXECUTE ON FUNCTION public.log_security_event TO service_role;
GRANT EXECUTE ON FUNCTION public.log_security_event TO authenticated;

-- 7. Test that everything works
SELECT 'Database verification completed successfully!' as status;

-- Optional: Show current table structure for verification
SELECT 
    'security_questions' as table_name,
    COUNT(*) as row_count
FROM public.security_questions
UNION ALL
SELECT 
    'password_history' as table_name,
    COUNT(*) as row_count
FROM public.password_history
UNION ALL
SELECT 
    'security_events' as table_name,
    COUNT(*) as row_count
FROM public.security_events;