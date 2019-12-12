class PostsController < ApplicationController
    
    def new
        @post = Post.new
    end
    
    def show
        
    end
    
    def edit
        
    end
    
    def create
        @post = current_user.posts.build(post_params)
        if @post.save
            flash[:success] = "ポストが作成されました"
            redirect_to home_pages_index_url
        else 
            flash[:danger] = "ポストが作成されませんでした"
            redirect_to home_pages_index_url
        end
    end
    
    def destroy
    
    end
    
    
    private
    
    def post_params 
        params.require(:post).permit(:content)
    end
    
end
