cloudinary.v2.api
  .delete_resources(['ajqkvckqcaxylm9zt4ws'], 
    { type: 'upload', resource_type: 'image' })
  .then(console.log);




  // cloudinary response
  /* 
  {
    "asset_id": "b5e6d2b39ba3e0869d67141ba7dba6cf",
    "public_id": "eneivicys42bq5f2jpn2",
    "api_key": "312924996162147",
    "version": 1570979139,
    "version_id": "98f52566f43d8e516a486958a45c1eb9",
    "signature": "abcdefghijklmnopqrstuvwxyz12345",
    "width": 1000,
    "height": 672,
    "format": "jpg",
    "resource_type": "image",
    "created_at": "2017-08-11T12:24:32Z",
    "tags": [],
    "pages": 1,
    "bytes": 350749,
    "type": "upload",
    "etag": "5297bd123ad4ddad723483c176e35f6e",
    "placeholder": false,
    "url": "http://res.cloudinary.com/demo/image/upload/v1570979139/eneivicys42bq5f2jpn2.jpg",
    "secure_url": "https://res.cloudinary.com/demo/image/upload/v1570979139/eneivicys42bq5f2jpn2.jpg",
    "access_mode": "public",
    "original_filename": "sample",
    "eager": [
      { "transformation": "c_pad,h_300,w_400",
        "width": 400,
        "height": 300,
        "url": "http://res.cloudinary.com/demo/image/upload/c_pad,h_300,w_400/v1570979139/eneivicys42bq5f2jpn2.jpg",
        "secure_url": "https://res.cloudinary.com/demo/image/upload/c_pad,h_300,w_400/v1570979139/eneivicys42bq5f2jpn2.jpg" },
      { "transformation": "c_crop,g_north,h_200,w_260",
        "width": 260,
        "height": 200,
        "url": "http://res.cloudinary.com/demo/image/upload/c_crop,g_north,h_200,w_260/v1570979139/eneivicys42bq5f2jpn2.jpg",
        "secure_url": "https://res.cloudinary.com/demo/image/upload/c_crop,g_north,h_200,w_260/v1570979139/eneivicys42bq5f2jpn2.jpg" }],
    "media_metadata": {
      "PerspectiveHorizontal": "0",
      "RedHue": "0",
      "Exposure": "0.0",
      
      "ExposureTime": "1/320"
    }
  }

  */