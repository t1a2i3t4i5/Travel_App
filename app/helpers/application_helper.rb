# frozen_string_literal: true

module ApplicationHelper
  def full_title(page_title = '')
    base_title = "Jaravlate"
    if page_title.empty?
      base_title
    else
      "#{ page_title } | #{ base_title }"
    end
  end

  def active_tab_post
    actions = %w[index new_arrival popular]
    actions.index(action_name)
  end

  def active_tab_user
    actions = %w[show liked_posts followings followers]
    actions.index(action_name)
  end
end
