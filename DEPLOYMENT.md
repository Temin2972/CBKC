# Triển khai website

# Database
## Gồm có 8 bảng
### Người dùng 
```
create table public.users (
  id uuid not null,
  email text null,
  full_name text null,
  role text null default 'student'::text,
  avatar_url text null,
  specialty text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  username text null,
  has_active_flags boolean null default false,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_username_key unique (username),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint users_role_check check (
    (
      role = any (
        array['student'::text, 'counselor'::text, 'admin'::text]
      )
    )
  )
) TABLESPACE pg_default;
```
### Phòng chat
```
create table public.chat_rooms (
  id uuid not null default gen_random_uuid (),
  student_id uuid not null,
  status text null default 'active'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  last_message_at timestamp with time zone null default now(),
  constraint chat_rooms_pkey primary key (id),
  constraint chat_rooms_student_id_key unique (student_id),
  constraint chat_rooms_student_id_fkey foreign KEY (student_id) references users (id) on delete CASCADE,
  constraint chat_rooms_status_check check (
    (
      status = any (array['active'::text, 'closed'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_chat_rooms_student_id on public.chat_rooms using btree (student_id) TABLESPACE pg_default;

create index IF not exists idx_chat_rooms_status on public.chat_rooms using btree (status) TABLESPACE pg_default;

create index IF not exists idx_chat_rooms_last_message on public.chat_rooms using btree (last_message_at desc) TABLESPACE pg_default;
```
### Tin nhắn
```
create table public.chat_messages (
  id uuid not null default gen_random_uuid (),
  chat_room_id uuid not null,
  sender_id uuid not null,
  content text not null,
  created_at timestamp with time zone null default now(),
  read_by uuid[] null default '{}'::uuid[],
  constraint chat_messages_pkey primary key (id),
  constraint chat_messages_chat_room_id_fkey foreign KEY (chat_room_id) references chat_rooms (id) on delete CASCADE,
  constraint chat_messages_sender_id_fkey foreign KEY (sender_id) references users (id) on delete CASCADE,
  constraint content_not_empty check (
    (
      length(
        TRIM(
          both
          from
            content
        )
      ) > 0
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_chat_messages_room_id on public.chat_messages using btree (chat_room_id) TABLESPACE pg_default;

create index IF not exists idx_chat_messages_sender_id on public.chat_messages using btree (sender_id) TABLESPACE pg_default;

create index IF not exists idx_chat_messages_created_at on public.chat_messages using btree (created_at) TABLESPACE pg_default;

create trigger trigger_update_last_message
after INSERT on chat_messages for EACH row
execute FUNCTION update_chat_room_last_message ();
```
### Bài đăng
```
create table public.posts (
  id uuid not null default gen_random_uuid (),
  author_id uuid not null,
  title text null,
  content text not null,
  image_url text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  liked_by uuid[] null default '{}'::uuid[],
  flag_level integer null default 0,
  constraint posts_pkey primary key (id),
  constraint posts_author_id_fkey foreign KEY (author_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_posts_liked_by on public.posts using gin (liked_by) TABLESPACE pg_default;

create index IF not exists idx_posts_flag_level on public.posts using btree (flag_level) TABLESPACE pg_default
where
  (flag_level > 0);
```
### Bình luận
```
create table public.comments (
  id uuid not null default gen_random_uuid (),
  post_id uuid not null,
  author_id uuid not null,
  parent_comment_id uuid null,
  content text not null,
  liked_by uuid[] null default '{}'::uuid[],
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  flag_level integer null default 0,
  constraint comments_pkey primary key (id),
  constraint comments_author_id_fkey foreign KEY (author_id) references auth.users (id) on delete CASCADE,
  constraint comments_parent_comment_id_fkey foreign KEY (parent_comment_id) references comments (id) on delete CASCADE,
  constraint comments_post_id_fkey foreign KEY (post_id) references posts (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_comments_post_id on public.comments using btree (post_id) TABLESPACE pg_default;

create index IF not exists idx_comments_author_id on public.comments using btree (author_id) TABLESPACE pg_default;

create index IF not exists idx_comments_parent_id on public.comments using btree (parent_comment_id) TABLESPACE pg_default;

create index IF not exists idx_comments_liked_by on public.comments using gin (liked_by) TABLESPACE pg_default;

create index IF not exists idx_comments_flag_level on public.comments using btree (flag_level) TABLESPACE pg_default
where
  (flag_level > 0);

create trigger update_comments_updated_at BEFORE
update on comments for EACH row
execute FUNCTION update_updated_at_column ();
```
### Nội dung chờ duyệt
```
create table public.pending_content (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  content_type character varying(20) not null,
  post_id uuid null,
  parent_comment_id uuid null,
  content text not null,
  image_url text null,
  pending_reason text null,
  status character varying(20) null default 'pending'::character varying,
  reviewed_at timestamp with time zone null,
  reviewed_by uuid null,
  rejection_reason text null,
  created_at timestamp with time zone null default now(),
  constraint pending_content_pkey primary key (id),
  constraint pending_content_parent_comment_id_fkey foreign KEY (parent_comment_id) references comments (id) on delete CASCADE,
  constraint pending_content_post_id_fkey foreign KEY (post_id) references posts (id) on delete CASCADE,
  constraint pending_content_reviewed_by_fkey foreign KEY (reviewed_by) references users (id),
  constraint pending_content_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint pending_content_content_type_check check (
    (
      (content_type)::text = any (
        (
          array[
            'post'::character varying,
            'comment'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint pending_content_status_check check (
    (
      (status)::text = any (
        (
          array[
            'pending'::character varying,
            'approved'::character varying,
            'rejected'::character varying,
            'flagged'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_pending_content_user_id on public.pending_content using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_pending_content_status on public.pending_content using btree (status) TABLESPACE pg_default;

create index IF not exists idx_pending_content_created_at on public.pending_content using btree (created_at desc) TABLESPACE pg_default;
```
### Nội dung gắn cờ
```
create table public.flagged_content (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  content_type character varying(20) not null,
  content_id uuid null,
  content text not null,
  flag_level integer not null default 1,
  category character varying(50) null,
  keywords text[] null,
  reasoning text null,
  is_resolved boolean null default false,
  resolved_at timestamp with time zone null,
  resolved_by uuid null,
  created_at timestamp with time zone null default now(),
  constraint flagged_content_pkey primary key (id),
  constraint flagged_content_resolved_by_fkey foreign KEY (resolved_by) references users (id),
  constraint flagged_content_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint flagged_content_content_type_check check (
    (
      (content_type)::text = any (
        (
          array[
            'post'::character varying,
            'comment'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_flagged_content_user_id on public.flagged_content using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_flagged_content_flag_level on public.flagged_content using btree (flag_level) TABLESPACE pg_default;

create index IF not exists idx_flagged_content_is_resolved on public.flagged_content using btree (is_resolved) TABLESPACE pg_default;

create index IF not exists idx_flagged_content_created_at on public.flagged_content using btree (created_at desc) TABLESPACE pg_default;
```
### Câu nói động viên
```
create table public.quotes (
  id uuid not null default gen_random_uuid (),
  content text not null,
  author text null,
  is_active boolean not null default true,
  constraint quotes_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_quotes_active on public.quotes using btree (is_active) TABLESPACE pg_default
where
  (is_active = true);
```
