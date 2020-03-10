# frozen_string_literal: true

module UserKensHelper
  # 行ったことある県か判定するメソッド
  def visited_ken?(user_id, ken_id)
    UserKen.find_by(user_id: user_id, ken_id: ken_id)
  end
end
