Base64Js = require "../lib/base64-js"
{decoder:Decoder, encoder:Encoder} = require "../lib/text-encoder"

encoder = new Encoder('utf-8')
decoder = new Decoder('utf-8')

module.exports =
  encode: (s) ->
    Base64Js.fromByteArray encoder.encode(s)

  decode: (b64string) ->
    decoder.decode Base64Js.toByteArray(b64string.replace(/\n/g, ''))
