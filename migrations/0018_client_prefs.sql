alter table admin_users add column if not exists otp_sign boolean not null default false;
alter table admin_users add column if not exists sign_otp_hash text not null default '';
alter table admin_users add column if not exists sign_otp_expires text not null default '';
