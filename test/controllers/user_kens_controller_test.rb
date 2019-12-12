require 'test_helper'

class UserKensControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get user_kens_create_url
    assert_response :success
  end

  test "should get destroy" do
    get user_kens_destroy_url
    assert_response :success
  end

end
