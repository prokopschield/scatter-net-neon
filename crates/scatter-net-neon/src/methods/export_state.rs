use std::sync::Arc;

use neon::types::extract::Json;
use scatter_net::{NetState, ScatterNet};

#[neon::export]
fn export_state(net: Arc<ScatterNet>) -> Json<NetState> {
    Json(net.export_state())
}
