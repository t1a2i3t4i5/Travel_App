if Rails.env.production? #本番環境の時にifに入ります。
  CarrierWave.configure do |config|
    config.fog_credentials = {
      :provider              => 'AWS',
      :region                => ENV['S3_REGION'],     # 例: 'ap-northeast-1'
      :aws_access_key_id     => ENV['S3_ACCESS_KEY'],
      :aws_secret_access_key => ENV['S3_SECRET_KEY']
    }
  
    config.fog_directory  = 'travelapp1998'
    config.cache_storage = :fog
  end
end
