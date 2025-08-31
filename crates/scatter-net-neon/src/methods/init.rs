use std::sync::Arc;

use neon::types::extract::Json;
use scatter_net::{NetConfig, NetState, ScatterNet};

#[neon::export]
async fn init(
    Json(config): Json<NetConfig>,
    Json(state): Json<NetState>,
) -> Result<Arc<ScatterNet>, String> {
    match ScatterNet::init(config, state).await {
        Ok(net) => Ok(Arc::new(net)),
        Err(err) => Err(err.to_string()),
    }
}
