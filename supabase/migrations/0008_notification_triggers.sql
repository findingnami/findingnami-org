-- Generates notifications when posts are inserted.
-- Branches on parent_id:
--   NULL  → new top-level post: notify all channel followers (except the author)
--   SET   → reply: notify the original post's author (if not the replier)
create or replace function generate_post_notification()
returns trigger as $$
declare
  v_author_name     text;
  v_channel_slug    text;
  v_parent_author   uuid;
  v_follow          record;
begin
  select full_name into v_author_name from profiles where id = new.author_id;

  if new.parent_id is null then
    -- Top-level post → notify channel followers
    if new.channel_id is not null then
      select slug into v_channel_slug from channels where id = new.channel_id;

      for v_follow in
        select user_id from channel_follows
        where channel_id = new.channel_id
          and user_id != new.author_id
      loop
        insert into notifications (user_id, type, title, body, link)
        values (
          v_follow.user_id,
          'new_post_in_channel',
          v_author_name || ' posted in #' || v_channel_slug,
          left(new.content, 120),
          '/feed?channel=' || v_channel_slug
        );
      end loop;
    end if;

  else
    -- Reply → notify original post's author
    select author_id into v_parent_author from posts where id = new.parent_id;

    if new.channel_id is not null then
      select slug into v_channel_slug from channels where id = new.channel_id;
    end if;

    if v_parent_author is not null and v_parent_author != new.author_id then
      insert into notifications (user_id, type, title, body, link)
      values (
        v_parent_author,
        'reply_to_post',
        v_author_name || ' replied to your post',
        left(new.content, 120),
        case
          when v_channel_slug is not null
            then '/feed?channel=' || v_channel_slug || '#post-' || new.parent_id::text
          else '/feed#post-' || new.parent_id::text
        end
      );
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_post_inserted
  after insert on posts
  for each row execute function generate_post_notification();
