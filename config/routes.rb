Rails.application.routes.draw do
  devise_for :users
  devise_scope :user do
    root :to => "devise/sessions#new"
  end
  get 'home_pages/index' => 'home_pages#index'
  resources :users
  resources :posts
  resources :kens , only: :show
  resource  :user_kens , only: [:destroy , :create]
  
end
