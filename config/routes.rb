Rails.application.routes.draw do
  get 'users/show'

  devise_for :users
  root 'home_pages#index'
  get 'home_pages/index'
  resources :users
end
