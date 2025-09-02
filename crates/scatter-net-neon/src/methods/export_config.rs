use std::sync::Arc;

use neon::types::extract::Json;
use scatter_net::{NetConfig, ScatterNet};

#[neon::export]
fn export_config(net: Arc<ScatterNet>) -> Json<NetConfig> {
    Json(net.export_config())
}
