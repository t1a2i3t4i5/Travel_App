Rails.application.routes.draw do

  devise_for :users, controllers: { registrations: 'users/registrations' }
  devise_scope :user do
    root :to => "devise/sessions#new"
  end
  
  get 'home_pages/index' => 'home_pages#index'
  
  resources :users do
    
    collection do
      #/users/prefecture_reset
      delete :prefecture_reset, :posts_reset
    end
    
    member do
      # /users/:id/ ...
      get :following, :followers
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
