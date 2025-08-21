use std::sync::Arc;

use ps_hkey::Hkey;
use scatter_net::ScatterNet;

#[neon::export]
async fn fetch(net: Arc<ScatterNet>, hkey: String) -> Result<Vec<u8>, String> {
    match Hkey::parse(hkey.as_bytes()).resolve_async(&*net).await {
        Ok(chunk) => Ok(chunk.data_ref().to_vec()),
        Err(err) => Err(err.to_string()),
    }
}
