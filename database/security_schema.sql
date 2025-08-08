-- Security Schema for CSSECDV Compliance
-- This file contains the database schema changes needed for security features

-- Table for tracking authentication attempts
CREATE TABLE IF NOT EXISTS auth_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public."Employees"(id),
    email VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    attempt_type VARCHAR(20) NOT NULL CHECK (attempt_type IN ('login', 'password_reset', 'otp_verify')),
    success BOOLEAN NOT NULL DEFAULT FALSE,
    failure_reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking account lockouts
CREATE TABLE IF NOT EXISTS account_lockouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public."Employees"(id),
    email VARCHAR(255) NOT NULL,
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    locked_until TIMESTAMP WITH TIME ZONE NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    reason VARCHAR(100) DEFAULT 'failed_login_attempts',
    is_active BOOLEAN DEFAULT TRUE
);

-- Table for password history (prevent password reuse)
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public."Employees"(id) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for security events logging
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public."Employees"(id),
    event_type VARCHAR(50) NOT NULL,
    event_description TEXT,
    ip_address INET,
    user_agent TEXT,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- First, let's add the new columns without touching the rank enum
ALTER TABLE public."Employees" 
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_ip INET,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS account_type VARCHAR(50) DEFAULT 'Employee' CHECK (account_type IN ('Employee', 'Admin', 'Developer', 'Website Administrator', 'Product Manager', 'Customer'));

-- We'll use the account_type column for the new user types instead of modifying the enum
-- The existing rank enum will remain as is for backward compatibility

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auth_attempts_email ON auth_attempts(email);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_created_at ON auth_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_user_id ON auth_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_user_id ON account_lockouts(user_id);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_email ON account_lockouts(email);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_locked_until ON account_lockouts(locked_until);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_lockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view authentication attempts
CREATE POLICY auth_attempts_admin_policy ON auth_attempts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public."Employees" 
            WHERE id = auth.uid() 
            AND (
                rank IN ('Admin', 'Developer') 
                OR account_type IN ('Admin', 'Developer', 'Website Administrator')
            )
        )
    );

-- Policy: Only admins can view account lockouts
CREATE POLICY account_lockouts_admin_policy ON account_lockouts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public."Employees" 
            WHERE id = auth.uid() 
            AND (
                rank IN ('Admin', 'Developer') 
                OR account_type IN ('Admin', 'Developer', 'Website Administrator')
            )
        )
    );

-- Policy: Users can only see their own password history (for preventing reuse)
CREATE POLICY password_history_user_policy ON password_history
    FOR SELECT USING (user_id = auth.uid());

-- Policy: Only system can insert password history
CREATE POLICY password_history_system_policy ON password_history
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy: Only admins can view security events
CREATE POLICY security_events_admin_policy ON security_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public."Employees" 
            WHERE id = auth.uid() 
            AND (
                rank IN ('Admin', 'Developer') 
                OR account_type IN ('Admin', 'Developer', 'Website Administrator')
            )
        )
    );

-- Function to clean up old authentication attempts (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_auth_attempts()
RETURNS void AS $$
BEGIN
    DELETE FROM auth_attempts 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired lockouts
CREATE OR REPLACE FUNCTION cleanup_expired_lockouts()
RETURNS void AS $$
BEGIN
    UPDATE account_lockouts 
    SET is_active = FALSE 
    WHERE locked_until < NOW() AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is locked out
CREATE OR REPLACE FUNCTION is_user_locked_out(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    lockout_record RECORD;
BEGIN
    SELECT * INTO lockout_record 
    FROM account_lockouts 
    WHERE email = user_email 
    AND is_active = TRUE 
    AND locked_until > NOW()
    ORDER BY locked_at DESC 
    LIMIT 1;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_description TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_severity TEXT DEFAULT 'medium',
    p_metadata JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO security_events (
        user_id, event_type, event_description, 
        ip_address, user_agent, severity, metadata
    ) VALUES (
        p_user_id, p_event_type, p_description,
        p_ip_address, p_user_agent, p_severity, p_metadata
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;