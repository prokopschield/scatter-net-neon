use std::{ops::Range, sync::Arc};

use neon::types::extract::Json;
use ps_hkey::Hkey;
use scatter_net::ScatterNet;

#[neon::export]
async fn fetch_slice(
    net: Arc<ScatterNet>,
    hkey: String,
    Json(range): Json<Range<usize>>,
) -> Result<Vec<u8>, String> {
    let hkey = Hkey::parse(hkey.as_bytes());

    match hkey.resolve_slice_async(&*net, range).await {
        Ok(vec) => Ok(vec),
        Err(err) => Err(err.to_string()),
    }
}
