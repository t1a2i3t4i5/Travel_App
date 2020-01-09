require 'carrierwave/storage/abstract'
require 'carrierwave/storage/file'
require 'carrierwave/storage/fog'

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