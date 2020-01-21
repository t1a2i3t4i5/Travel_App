Rails.application.routes.draw do

  devise_for :users, controllers: { registrations: 'users/registrations' }
  devise_scope :user do
    root :to => "devise/sessions#new"
  end
  get 'home_pages/index' => 'home_pages#index'
  resources :users do
    collection do
      delete :prefecture_reset
      delete :posts_reset
    end
  end
  
  get 'tags/show' => 'tags#show'

  resources :posts do
    resources :likes, only: [:create, :destroy]
  end
  
  resources :kens ,           only: :show
  resources :relationships,   only: [:create, :destroy]
  resources :user_kens ,      only: [:create, :destroy]
  
end
