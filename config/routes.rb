Rails.application.routes.draw do
  devise_for :users
  devise_scope :user do
    root :to => "devise/sessions#new"
  end
  get 'home_pages/index' => 'home_pages#index'
  resources :users
    

  resources :posts do
    resources :likes, only: [:create, :destroy]
  end
  
  resources :kens ,           only: :show
  resources :relationships,   only: [:create, :destroy]
  resource  :user_kens ,      only: [:destroy , :create]
end
