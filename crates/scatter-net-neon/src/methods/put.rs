use std::sync::Arc;

use bytes::Bytes;
use scatter_net::ScatterNet;

#[neon::export]
async fn put(net: Arc<ScatterNet>, data: Vec<u8>) -> Result<String, String> {
    match net.put_blob(Bytes::from_owner(data)).await {
        Ok(hkey) => Ok(hkey.to_string()),
        Err(err) => Err(err.to_string()),
    }
}
