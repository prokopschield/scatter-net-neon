use std::sync::Arc;

use neon::types::extract::Json;
use scatter_net::{NetConfig, NetState, ScatterNet};

#[neon::export]
async fn init(config: Json<NetConfig>, state: Json<NetState>) -> Result<Arc<ScatterNet>, String> {
    match ScatterNet::init(config.0, state.0).await {
        Ok(net) => Ok(Arc::new(net)),
        Err(err) => Err(err.to_string()),
    }
}
