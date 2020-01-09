class ImageUploader < CarrierWave::Uploader::Base
  include CarrierWave::RMagick
  
  #本番環境の時と開発環境の時に保存する場所を変えている
  if Rails.env.development?
    storage :file
  elsif Rails.env.test?
    storage :file
  else
    storage :fog
  end

  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  # Provide a default URL as a default if there hasn't been a file uploaded:
  def default_url(*args)
  #   # For Rails 3.1+ asset pipeline compatibility:
  #   # ActionController::Base.helpers.asset_path("fallback/" + [version_name, "default.png"].compact.join('_'))
    "default.jpg"
  #   "/images/fallback/" + [version_name, "default.png"].compact.join('_')
  end
 
 # 画像の上限を640x480にする
  process :resize_to_limit => [640, 480]
 
  # 保存形式をJPGにする
  process :convert => 'jpg'
 
  # サムネイルを生成する設定
  version :thumb do
    process :resize_to_limit => [300, 300]
  end
   
  version :thumb100 do
    process :resize_to_limit => [100, 100]
  end
 
  version :thumb30 do
    process :resize_to_limit => [30, 30]
  end
 
  # jpg,jpeg,gif,pngしか受け付けない
  def extension_white_list
    %w(jpg jpeg gif png)
  end
 
 # 拡張子が同じでないとGIFをJPGとかにコンバートできないので、ファイル名を変更
  def filename
    super.chomp(File.extname(super)) + '.jpg' if original_filename.present?
  end
 
 # ファイル名を日付にするとタイミングのせいでサムネイル名がずれる
 #ファイル名はランダムで一意になる
  def filename
    "#{secure_token}.#{file.extension}" if original_filename.present?
  end
 
  protected
  def secure_token
    var = :"@#{mounted_as}_secure_token"
    model.instance_variable_get(var) or model.instance_variable_set(var, SecureRandom.uuid)
  end
 
 
end
