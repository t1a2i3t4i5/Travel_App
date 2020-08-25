# frozen_string_literal: true

Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: 'users/registrations' }
  devise_scope :user do
    root to: 'posts#index'
  end

  get 'home_pages/index' => 'home_pages#index'
  get 'tags/show' => 'tags#show'
  get 'searchs/index' => 'searchs#index'

  resources :users do
    collection do
      # /users/prefecture_reset
      delete :prefecture_reset, :posts_reset
    end
    member do
      # /users/:id/ ...
      get :following, :followers
    end
  end

  resources :posts do
    collection do
      get :new_arrival
      get :popular
    end
    resources :likes, only: %i[create destroy]
    resources :comments, only: %i[create destroy]
  end

  resources :kens, only: :show
  resources :relationships, only: %i[create destroy]
  resources :user_kens, only: %i[create destroy]
end
