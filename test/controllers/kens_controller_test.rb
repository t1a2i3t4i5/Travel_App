require 'test_helper'

class KensControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get kens_show_url
    assert_response :success
  end

end
