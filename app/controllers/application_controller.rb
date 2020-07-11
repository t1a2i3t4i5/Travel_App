# frozen_string_literal: true

class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  before_action :configure_permitted_parameters, if: :devise_controller?

  # ログイン後のページをタイムラインに変更
  def after_sign_in_path_for(_resource)
    home_pages_index_path
  end

  private

  def configure_permitted_parameters
    # ユーザー作成時に名前を追加するためのストロングぱためーた
    devise_parameter_sanitizer.permit(:sign_up, keys: %i[name image]) # 新規登録時(sign_up時)にnameとimageキーのパラメーターを追加で許可する
    # アカウント編集の時にnameとimageとintroducitonのストロングパラメータを追加
    devise_parameter_sanitizer.permit(:account_update, keys: %i[name image introduction])
  end
end
