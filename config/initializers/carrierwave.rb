if Rails.env.production? #本番環境の時にifに入ります。
  CarrierWave.configure do |config|
    config.fog_credentials = {
      provider: 'AWS',
      aws_access_key_id: 'AKIAVX5HNTR2AZUUPMK7',
      aws_secret_access_key: '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',
      region: 'ap-northeast-1'
    }
  
    config.fog_directory  = 'travelapp1998'
    config.cache_storage = :fog
  end
end
