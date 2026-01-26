use oxc_linter::ExternalLinter;

mod code_actions;
mod commands;
mod error_with_position;
mod lsp_file_system;
mod options;
mod server_linter;
#[cfg(test)]
mod tester;
mod utils;

/// Run the language server
pub async fn run_lsp(external_linter: Option<ExternalLinter>) {
    run_lsp_with_builder(crate::lsp::server_linter::ServerLinterBuilder::new(external_linter))
        .await;
}

#[cfg(feature = "napi")]
pub async fn run_lsp_with_js_config_loader(
    external_linter: Option<ExternalLinter>,
    js_config_loader: Option<crate::lint::JsConfigLoaderCb>,
) {
    run_lsp_with_builder(
        crate::lsp::server_linter::ServerLinterBuilder::new(external_linter)
            .with_js_config_loader(js_config_loader),
    )
    .await;
}

async fn run_lsp_with_builder(builder: crate::lsp::server_linter::ServerLinterBuilder) {
    oxc_language_server::run_server(
        "oxlint".to_string(),
        env!("CARGO_PKG_VERSION").to_string(),
        vec![Box::new(builder)],
    )
    .await;
}
