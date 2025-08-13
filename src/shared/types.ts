// Local type definitions for Sheets IDE
// Replaces @roo-code/types dependencies

// EventEmitter stub for browser compatibility
export class EventEmitter {
	private events: { [key: string]: Function[] } = {}
	
	on(event: string, listener: Function) {
		if (!this.events[event]) this.events[event] = []
		this.events[event].push(listener)
	}
	
	emit(event: string, ...args: any[]) {
		if (this.events[event]) {
			this.events[event].forEach(listener => listener(...args))
		}
	}
	
	removeAllListeners() {
		this.events = {}
	}
}

export type ProviderName =
	| "anthropic"
	| "openai"
	| "openrouter"
	| "bedrock"
	| "vertex"
	| "openai-native"
	| "gemini"
	| "ollama"
	| "lmstudio"
	| "glama"
	| "requesty"
	| "litellm"
	| "mistral"
	| "xai"
	| "groq"
	| "fireworks"
	| "deepseek"
	| "cerebras"
	| "sambanova"
	| "chutes"
	| "zai"
	| "doubao"
	| "moonshot"
	| "unbound"
	| "vscode-lm"
	| "human-relay"
	| "fake-ai"
	| "claude-code"
	| "huggingface"
	| "gemini-cli"

export interface ModelInfo {
	id: string
	name?: string
	description?: string
	contextWindow?: number
	maxTokens?: number
	inputPrice?: number
	outputPrice?: number
	supportsImages?: boolean
	supportsPromptCache?: boolean
	supportsComputerUse?: boolean
	requiredReasoningBudget?: boolean
	supportsReasoningBudget?: boolean
	supportsReasoningEffort?: boolean
	reasoningEffort?: boolean
}

export interface ProviderSettings {
	apiProvider: ProviderName
	apiKey?: string
	apiBaseUrl?: string
	apiModelId?: string
	anthropicApiKey?: string
	anthropicBaseUrl?: string
	anthropicModelId?: string
	openAiApiKey?: string
	openAiBaseUrl?: string
	openAiModelId?: string
	openRouterApiKey?: string
	openRouterBaseUrl?: string
	openRouterModelId?: string
	bedrockAccessKey?: string
	bedrockSecretKey?: string
	bedrockRegion?: string
	bedrockModelId?: string
	vertexProjectId?: string
	vertexRegion?: string
	vertexModelId?: string
	geminiApiKey?: string
	geminiBaseUrl?: string
	geminiModelId?: string
	ollamaBaseUrl?: string
	ollamaModelId?: string
	lmStudioBaseUrl?: string
	lmStudioModelId?: string
	glamaApiKey?: string
	glamaModelId?: string
	requestyApiKey?: string
	requestyModelId?: string
	litellmApiKey?: string
	litellmBaseUrl?: string
	litellmModelId?: string
	mistralApiKey?: string
	mistralModelId?: string
	xaiApiKey?: string
	xaiModelId?: string
	groqApiKey?: string
	groqModelId?: string
	fireworksApiKey?: string
	fireworksModelId?: string
	deepSeekApiKey?: string
	deepSeekModelId?: string
	cerebrasApiKey?: string
	cerebrasModelId?: string
	sambaNovaApiKey?: string
	sambaNovaModelId?: string
	chutesApiKey?: string
	chutesModelId?: string
	zaiApiKey?: string
	zaiModelId?: string
	doubaoApiKey?: string
	doubaoModelId?: string
	moonshotApiKey?: string
	moonshotModelId?: string
	unboundApiKey?: string
	unboundModelId?: string
	vsCodeLmModelSelector?: any
	temperature?: number
	maxTokens?: number
	topP?: number
	topK?: number
	presencePenalty?: number
	frequencyPenalty?: number
	consecutiveMistakeLimit?: number
	id?: string
	// Additional missing properties
	enableReasoningEffort?: boolean
	reasoningEffort?: boolean
	claudeCodeMaxOutputTokens?: number
	modelMaxTokens?: number
	// AWS/Bedrock specific
	awsRegion?: string
	awsCustomArn?: string
	awsUseCrossRegionInference?: boolean
	awsAccessKey?: string
	awsSecretKey?: string
	awsBedrockEndpoint?: string
	awsBedrockEndpointEnabled?: boolean
	// Vertex specific
	vertexJsonCredentials?: string
	vertexKeyFile?: string
	// Anthropic specific
	anthropicUseAuthToken?: boolean
	// OpenAI specific
	openAiUseAzure?: boolean
	openAiHeaders?: Record<string, string>
	azureApiVersion?: string
	openAiR1FormatEnabled?: boolean
	openAiLegacyFormat?: boolean
	openAiStreamingEnabled?: boolean
	openAiCustomModelInfo?: any
	openAiNativeApiKey?: string
	openAiNativeBaseUrl?: string
	// OpenRouter specific
	openRouterUseMiddleOutTransform?: boolean
	openRouterSpecificProvider?: string
	// Gemini specific
	enableUrlContext?: boolean
	enableGrounding?: boolean
	googleGeminiBaseUrl?: string
	// LM Studio specific
	lmStudioSpeculativeDecodingEnabled?: boolean
	lmStudioModelName?: string
	// Hugging Face specific
	huggingFaceApiKey?: string
	huggingFaceModelId?: string
	// LiteLLM specific
	litellmUsePromptCache?: boolean
	// Mistral specific
	mistralCodestralUrl?: string
	// Claude Code specific
	claudeCodePath?: string
	// DeepSeek specific
	deepSeekBaseUrl?: string
	// Doubao specific
	doubaoBaseUrl?: string
	// Moonshot specific
	moonshotBaseUrl?: string
	// ZAI specific
	zaiApiLine?: string
	// Fake AI specific
	fakeAi?: any
	// Model temperature (legacy)
	modelTemperature?: number
	// Additional AWS properties
	awsUseApiKey?: boolean
	awsApiKey?: string
	awsUseProfile?: boolean
	awsProfile?: string
	awsSessionToken?: string
}

export interface ProviderSettingsEntry {
	id: string
	name: string
	apiProvider: ProviderName
	createdAt?: number
	updatedAt?: number
}

export interface HistoryItem {
	id: string
	ts: number
	task: string
	tokensIn: number
	tokensOut: number
	cacheWrites?: number
	cacheReads?: number
	totalCost: number
	mode?: string
	number?: number
}

export interface ClineMessage {
	ts: number
	type: "ask" | "say"
	ask?: ClineAsk
	say?: ClineSay
	text?: string
	images?: string[]
}

export interface ClineAsk {
	type: "followup" | "command" | "completion" | "tool" | "api_req_failed" | "resume_task" | "resume_completed_task" | "mistake_limit_reached"
	text?: string
	tool?: string
	command?: string
	request?: string
	response?: string
}

export interface ClineSay {
	type: "text" | "code" | "shell" | "diff" | "image" | "error" | "success" | "info" | "warning"
	text?: string
	code?: string
	language?: string
	path?: string
	diff?: string
	images?: string[]
}

export interface TodoItem {
	id: string
	text: string
	status: TodoStatus
	createdAt: number
	updatedAt: number
}

export type TodoStatus = "pending" | "in_progress" | "completed"

export interface ModeConfig {
	slug: string
	name: string
	description?: string
	systemPrompt?: string
	tools?: string[]
	allowedFilePatterns?: string[]
	deniedFilePatterns?: string[]
	source?: "global" | "project"
	roleDefinition?: string
	customInstructions?: string
	whenToUse?: string
	groups?: GroupEntry[]
}

export interface PromptComponent {
	systemPrompt?: string
	tools?: string[]
	allowedFilePatterns?: string[]
	deniedFilePatterns?: string[]
	roleDefinition?: string
	customInstructions?: string
	whenToUse?: string
	description?: string
}

export type CustomModePrompts = Record<string, PromptComponent>

export interface GlobalState {
	currentApiConfigName?: string
	listApiConfigMeta?: ProviderSettingsEntry[]
	pinnedApiConfigs?: Record<string, boolean>
	customInstructions?: string
	autoApprovalEnabled?: boolean
	alwaysAllowReadOnly?: boolean
	alwaysAllowReadOnlyOutsideWorkspace?: boolean
	alwaysAllowWrite?: boolean
	alwaysAllowWriteOutsideWorkspace?: boolean
	alwaysAllowWriteProtected?: boolean
	alwaysAllowBrowser?: boolean
	alwaysApproveResubmit?: boolean
	alwaysAllowMcp?: boolean
	alwaysAllowModeSwitch?: boolean
	alwaysAllowSubtasks?: boolean
	alwaysAllowExecute?: boolean
	alwaysAllowUpdateTodoList?: boolean
	allowedCommands?: string[]
	deniedCommands?: string[]
	allowedMaxRequests?: number
	allowedMaxCost?: number
	browserToolEnabled?: boolean
	browserViewportSize?: string
	screenshotQuality?: number
	remoteBrowserEnabled?: boolean
	remoteBrowserHost?: string
	ttsEnabled?: boolean
	ttsSpeed?: number
	soundEnabled?: boolean
	soundVolume?: number
	maxOpenTabsContext?: number
	maxWorkspaceFiles?: number
	showRooIgnoredFiles?: boolean
	maxReadFileLine?: number
	maxConcurrentFileReads?: number
	terminalOutputLineLimit?: number
	terminalOutputCharacterLimit?: number
	terminalShellIntegrationTimeout?: number
	terminalShellIntegrationDisabled?: boolean
	terminalCommandDelay?: number
	terminalPowershellCounter?: boolean
	terminalZshClearEolMark?: boolean
	terminalZshOhMy?: boolean
	terminalZshP10k?: boolean
	terminalZdotdir?: boolean
	terminalCompressProgressBar?: boolean
	diagnosticsEnabled?: boolean
	diffEnabled?: boolean
	enableCheckpoints?: boolean
	fuzzyMatchThreshold?: number
	experiments?: Experiments
	language?: Language
	telemetrySetting?: TelemetrySetting
	mcpEnabled?: boolean
	enableMcpServerCreation?: boolean
	mode?: string
	modeApiConfigs?: Record<string, string>
	customModes?: ModeConfig[]
	customModePrompts?: CustomModePrompts
	customSupportPrompts?: Record<string, string>
	enhancementApiConfigId?: string
	condensingApiConfigId?: string
	customCondensingPrompt?: string
	codebaseIndexConfig?: any
	codebaseIndexModels?: any
	profileThresholds?: Record<string, number>
	includeDiagnosticMessages?: boolean
	maxDiagnosticMessages?: number
	taskHistory?: HistoryItem[]
	writeDelayMs?: number
	requestDelaySeconds?: number
	maxImageFileSize?: number
	maxTotalImageSize?: number
	historyPreviewCollapsed?: boolean
	cloudUserInfo?: CloudUserInfo | null
	cloudIsAuthenticated?: boolean
	sharingEnabled?: boolean
	organizationAllowList?: OrganizationAllowList
	organizationSettingsVersion?: number
	autoCondenseContext?: boolean
	autoCondenseContextPercent?: number
	marketplaceItems?: MarketplaceItem[]
	marketplaceInstalledMetadata?: any
	hasOpenedModeSelector?: boolean
	alwaysAllowFollowupQuestions?: boolean
	followupAutoApproveTimeoutMs?: number
	includeTaskHistoryInEnhance?: boolean
	// Additional missing properties
	lastShownAnnouncementId?: string
	lastModeExportPath?: string
	lastModeImportPath?: string
	// Sheets IDE specific
	selectedSpreadsheetId?: string
	selectedSpreadsheetName?: string
	selectedRange?: string
}

export type Language = "en" | "es" | "fr" | "de" | "it" | "pt-BR" | "ru" | "ja" | "ko" | "zh-CN" | "zh-TW" | "hi" | "tr" | "pl" | "nl" | "ca" | "vi" | "id"

export type TelemetrySetting = "enabled" | "disabled" | "unset"

export interface Experiments {
	[key: string]: boolean
}

export interface CloudUserInfo {
	id: string
	email: string
	name?: string
	imageUrl?: string
}

export type OrganizationAllowList = {
	providers: string[]
	models: string[]
} | string

export interface MarketplaceItem {
	id: string
	name: string
	description: string
	type: MarketplaceItemType
	author: string
	version: string
	tags: string[]
	installUrl?: string
	configTemplate?: any
}

export type MarketplaceItemType = "mcp" | "mode" | "tool"

export interface InstallMarketplaceItemOptions {
	scope?: "global" | "project"
	parameters?: Record<string, any>
}

export type ShareVisibility = "public" | "organization" | "private"

// Tool related types
export type ToolName =
	| "read_file"
	| "write_to_file"
	| "apply_diff"
	| "search_and_replace"
	| "insert_content"
	| "list_files"
	| "list_code_definition_names"
	| "search_files"
	| "execute_command"
	| "browser_action"
	| "use_mcp_tool"
	| "access_mcp_resource"
	| "ask_followup_question"
	| "attempt_completion"
	| "switch_mode"
	| "new_task"
	| "update_todo_list"
	| "fetch_instructions"
	| "codebase_search"
	// Sheets IDE specific tools
	| "read_range"
	| "write_range"
	| "create_sheet"
	| "set_formula"
	| "format_cells"

export interface ToolProgressStatus {
	type: "progress"
	message: string
	progress?: number
}

export type ToolGroup = "file" | "search" | "execute" | "browser" | "mcp" | "task" | "sheets" | "read" | "edit" | "command" | "modes"

export interface ToolUsage {
	tool: ToolName
	path?: string
	content?: string
	diff?: string
	command?: string
	url?: string
	coordinate?: string
	text?: string
	serverName?: string
	toolName?: string
	arguments?: any
	uri?: string
	question?: string
	result?: string
	mode?: string
	reason?: string
	todos?: TodoItem[]
	// Sheets specific
	spreadsheetId?: string
	range?: string
	values?: any[][]
	sheetName?: string
	formula?: string
	format?: any
}

export type McpExecutionStatus = "pending" | "running" | "completed" | "failed"

// Constants
export const ANTHROPIC_DEFAULT_MAX_TOKENS = 8192
export const CLAUDE_CODE_DEFAULT_MAX_OUTPUT_TOKENS = 8192
export const DEFAULT_TERMINAL_OUTPUT_CHARACTER_LIMIT = 50000
export const DEFAULT_WRITE_DELAY_MS = 200
export const DEFAULT_CONSECUTIVE_MISTAKE_LIMIT = 3
export const ORGANIZATION_ALLOW_ALL = "*"

// Event names
export enum RooCodeEventName {
	TaskCreated = "task_created",
	TaskFocused = "task_focused", 
	TaskUnfocused = "task_unfocused",
	TaskModeSwitched = "task_mode_switched"
}

export enum TelemetryEventName {
	AUTHENTICATION_INITIATED = "authentication_initiated"
}

// Schema validation helpers
export const toolNames: ToolName[] = [
	"read_file",
	"write_to_file",
	"apply_diff", 
	"search_and_replace",
	"insert_content",
	"list_files",
	"list_code_definition_names",
	"search_files",
	"execute_command",
	"browser_action",
	"use_mcp_tool",
	"access_mcp_resource",
	"ask_followup_question",
	"attempt_completion",
	"switch_mode",
	"new_task",
	"update_todo_list",
	"read_range",
	"write_range", 
	"create_sheet",
	"set_formula",
	"format_cells"
]

export const todoStatusSchema = {
	enum: ["pending", "in_progress", "completed"] as const
}

export function isLanguage(value: string): value is Language {
	const languages: Language[] = ["en", "es", "fr", "de", "it", "pt-BR", "ru", "ja", "ko", "zh-CN", "zh-TW", "hi", "tr", "pl", "nl", "ca", "vi", "id"]
	return languages.includes(value as Language)
}

// Global state and secret keys
export const GLOBAL_STATE_KEYS = [
	"currentApiConfigName",
	"listApiConfigMeta", 
	"pinnedApiConfigs",
	"customInstructions",
	"autoApprovalEnabled",
	"alwaysAllowReadOnly",
	"alwaysAllowReadOnlyOutsideWorkspace",
	"alwaysAllowWrite",
	"alwaysAllowWriteOutsideWorkspace", 
	"alwaysAllowWriteProtected",
	"alwaysAllowBrowser",
	"alwaysApproveResubmit",
	"alwaysAllowMcp",
	"alwaysAllowModeSwitch",
	"alwaysAllowSubtasks",
	"alwaysAllowExecute",
	"alwaysAllowUpdateTodoList",
	"allowedCommands",
	"deniedCommands",
	"allowedMaxRequests",
	"allowedMaxCost",
	"browserToolEnabled",
	"browserViewportSize",
	"screenshotQuality",
	"remoteBrowserEnabled",
	"remoteBrowserHost",
	"ttsEnabled",
	"ttsSpeed",
	"soundEnabled",
	"soundVolume",
	"maxOpenTabsContext",
	"maxWorkspaceFiles",
	"showRooIgnoredFiles",
	"maxReadFileLine",
	"maxConcurrentFileReads",
	"terminalOutputLineLimit",
	"terminalOutputCharacterLimit",
	"terminalShellIntegrationTimeout",
	"terminalShellIntegrationDisabled",
	"terminalCommandDelay",
	"terminalPowershellCounter",
	"terminalZshClearEolMark",
	"terminalZshOhMy",
	"terminalZshP10k",
	"terminalZdotdir",
	"terminalCompressProgressBar",
	"diagnosticsEnabled",
	"diffEnabled",
	"enableCheckpoints",
	"fuzzyMatchThreshold",
	"experiments",
	"language",
	"telemetrySetting",
	"mcpEnabled",
	"enableMcpServerCreation",
	"mode",
	"modeApiConfigs",
	"customModes",
	"customModePrompts",
	"customSupportPrompts",
	"enhancementApiConfigId",
	"condensingApiConfigId",
	"customCondensingPrompt",
	"codebaseIndexConfig",
	"codebaseIndexModels",
	"profileThresholds",
	"includeDiagnosticMessages",
	"maxDiagnosticMessages",
	"taskHistory",
	"writeDelayMs",
	"requestDelaySeconds",
	"maxImageFileSize",
	"maxTotalImageSize",
	"historyPreviewCollapsed",
	"cloudUserInfo",
	"cloudIsAuthenticated",
	"sharingEnabled",
	"organizationAllowList",
	"organizationSettingsVersion",
	"autoCondenseContext",
	"autoCondenseContextPercent",
	"marketplaceItems",
	"marketplaceInstalledMetadata",
	"hasOpenedModeSelector",
	"alwaysAllowFollowupQuestions",
	"followupAutoApproveTimeoutMs",
	"includeTaskHistoryInEnhance",
	"selectedSpreadsheetId",
	"selectedSpreadsheetName",
	"selectedRange",
	"lastShownAnnouncementId",
	"lastModeExportPath",
	"lastModeImportPath"
] as const

export const SECRET_STATE_KEYS = [
	"anthropicApiKey",
	"openAiApiKey",
	"openRouterApiKey",
	"bedrockAccessKey",
	"bedrockSecretKey",
	"geminiApiKey",
	"glamaApiKey",
	"requestyApiKey",
	"litellmApiKey",
	"mistralApiKey",
	"xaiApiKey",
	"groqApiKey",
	"fireworksApiKey",
	"deepSeekApiKey",
	"cerebrasApiKey",
	"sambaNovaApiKey",
	"chutesApiKey",
	"zaiApiKey",
	"doubaoApiKey",
	"moonshotApiKey",
	"unboundApiKey",
	"codeIndexOpenAiKey",
	"codeIndexQdrantApiKey",
	"codebaseIndexOpenAiCompatibleApiKey",
	"codebaseIndexGeminiApiKey",
	"codebaseIndexMistralApiKey"
] as const

export type GlobalStateKey = typeof GLOBAL_STATE_KEYS[number]
export type SecretStateKey = typeof SECRET_STATE_KEYS[number]

export function isGlobalStateKey(key: string): key is GlobalStateKey {
	return GLOBAL_STATE_KEYS.includes(key as GlobalStateKey)
}

export function isSecretStateKey(key: string): key is SecretStateKey {
	return SECRET_STATE_KEYS.includes(key as SecretStateKey)
}

// Schema definitions (simplified versions)
export const globalSettingsSchema = {
	type: "object",
	properties: {
		currentApiConfigName: { type: "string" },
		customInstructions: { type: "string" },
		// Add other properties as needed
	}
}

export const modeConfigSchema = {
	type: "object",
	properties: {
		slug: { type: "string" },
		name: { type: "string" },
		description: { type: "string" },
		systemPrompt: { type: "string" },
		tools: { type: "array", items: { type: "string" } },
		allowedFilePatterns: { type: "array", items: { type: "string" } },
		deniedFilePatterns: { type: "array", items: { type: "string" } },
		source: { enum: ["global", "project"] }
	},
	required: ["slug", "name"]
}

export const customModesSettingsSchema = {
	type: "object",
	properties: {
		modes: { type: "array", items: modeConfigSchema }
	}
}

export const marketplaceItemSchema = {
	type: "object",
	properties: {
		id: { type: "string" },
		name: { type: "string" },
		description: { type: "string" },
		type: { enum: ["mcp", "mode", "tool"] },
		author: { type: "string" },
		version: { type: "string" },
		tags: { type: "array", items: { type: "string" } }
	},
	required: ["id", "name", "description", "type", "author", "version"]
}

// Default values
export const experimentDefault: Experiments = {}

// Model defaults
export const anthropicDefaultModelId = "claude-3-5-sonnet-20241022"
export const openAiDefaultModelId = "gpt-4o"
export const openRouterDefaultModelId = "anthropic/claude-3.5-sonnet"
export const glamaDefaultModelId = "llama-3.1-70b-versatile"
export const requestyDefaultModelId = "claude-3-5-sonnet-20241022"

// Default modes
export const DEFAULT_MODES: ModeConfig[] = [
	{
		slug: "architect",
		name: "🏗️ Architect",
		description: "Plan and design before implementation"
	},
	{
		slug: "code", 
		name: "💻 Code",
		description: "Write, modify, and refactor code"
	},
	{
		slug: "ask",
		name: "❓ Ask", 
		description: "Get explanations and answers"
	},
	{
		slug: "debug",
		name: "🪲 Debug",
		description: "Troubleshoot and fix issues"
	}
]

export const defaultModeSlug = "code"

// Additional missing types for SheetsProvider
export interface TaskProviderEvents {
	[key: string]: any
}

export interface TaskProviderLike {
	getCurrentCline(): any
	initClineWithTask(text?: string, images?: string[]): Promise<any>
	initClineWithSubTask(parent: any, task?: string, images?: string[]): Promise<any>
}

export interface TelemetryPropertiesProvider {
	getTelemetryProperties(): Promise<TelemetryProperties>
}

export interface TelemetryProperties {
	[key: string]: any
}

export type CodeActionId = string
export type CodeActionName = string
export type TerminalActionId = string
export type TerminalActionPromptType = string

export type RooCodeSettings = GlobalState

// Additional missing interfaces
export interface TokenUsage {
	inputTokens: number
	outputTokens: number
	cacheCreationInputTokens?: number
	cacheReadInputTokens?: number
}

export interface GlobalSettings extends GlobalState {}

// Command and action types
export type CommandId = string

// Validation functions
export function isBlockingAsk(ask: ClineAsk): boolean {
	return ask.type === "command" || ask.type === "completion"
}

// Additional constants
export const ANTHROPIC_DEFAULT_TEMPERATURE = 0
export const OPENAI_DEFAULT_TEMPERATURE = 0
export const DEEP_SEEK_DEFAULT_TEMPERATURE = 0
export const MISTRAL_DEFAULT_TEMPERATURE = 0
export const GLAMA_DEFAULT_TEMPERATURE = 0
export const GROQ_DEFAULT_TEMPERATURE = 0
export const FIREWORKS_DEFAULT_TEMPERATURE = 0
export const CEREBRAS_DEFAULT_TEMPERATURE = 0
export const SAMBANOVA_DEFAULT_TEMPERATURE = 0
export const CHUTES_DEFAULT_TEMPERATURE = 0
export const ZAI_DEFAULT_TEMPERATURE = 0
export const DOUBAO_DEFAULT_TEMPERATURE = 0
export const MOONSHOT_DEFAULT_TEMPERATURE = 0
export const UNBOUND_DEFAULT_TEMPERATURE = 0
export const LMSTUDIO_DEFAULT_TEMPERATURE = 0
export const HUGGINGFACE_DEFAULT_TEMPERATURE = 0
export const HUGGINGFACE_DEFAULT_CONTEXT_WINDOW = 4096

// Model ID types
export type AnthropicModelId = string
export type OpenAIModelId = string
export type OpenRouterModelId = string
export type BedrockModelId = string
export type VertexModelId = string
export type GeminiModelId = string
export type OllamaModelId = string
export type LMStudioModelId = string
export type GlamaModelId = string
export type RequestyModelId = string
export type LiteLLMModelId = string
export type MistralModelId = string
export type XAIModelId = string
export type GroqModelId = string
export type FireworksModelId = string
export type DeepSeekModelId = string
export type CerebrasModelId = string
export type SambaNovaModelId = string
export type ChutesModelId = string
export type ZAIModelId = string
export type DoubaoModelId = string
export type MoonshotModelId = string
export type UnboundModelId = string

// Default model IDs
export const anthropicModels: Record<string, ModelInfo> = {}
export const openAiModels: Record<string, ModelInfo> = {}
export const openRouterModels: Record<string, ModelInfo> = {}
export const bedrockModels: Record<string, ModelInfo> = {}
export const vertexModels: Record<string, ModelInfo> = {}
export const geminiModels: Record<string, ModelInfo> = {}
export const ollamaModels: Record<string, ModelInfo> = {}
export const lmStudioModels: Record<string, ModelInfo> = {}
export const glamaModels: Record<string, ModelInfo> = {}
export const requestyModels: Record<string, ModelInfo> = {}
export const litellmModels: Record<string, ModelInfo> = {}
export const mistralModels: Record<string, ModelInfo> = {}
export const xaiModels: Record<string, ModelInfo> = {}
export const groqModels: Record<string, ModelInfo> = {}
export const fireworksModels: Record<string, ModelInfo> = {}
export const deepSeekModels: Record<string, ModelInfo> = {}
export const cerebrasModels: Record<string, ModelInfo> = {}
export const sambaNovaModels: Record<string, ModelInfo> = {}
export const chutesModels: Record<string, ModelInfo> = {}
export const zaiModels: Record<string, ModelInfo> = {}
export const doubaoModels: Record<string, ModelInfo> = {}
export const moonshotModels: Record<string, ModelInfo> = {}
export const unboundModels: Record<string, ModelInfo> = {}

// Default model info helpers
export const openAiModelInfoSaneDefaults: Partial<ModelInfo> = {
	contextWindow: 4096,
	maxTokens: 2048,
	supportsImages: false,
	supportsPromptCache: false,
	supportsComputerUse: false
}

export const lMStudioDefaultModelInfo: ModelInfo = {
	id: "default",
	name: "Default LM Studio Model",
	contextWindow: 4096,
	maxTokens: 2048
}

export const ollamaDefaultModelInfo: ModelInfo = {
	id: "llama2",
	name: "Llama 2",
	contextWindow: 4096,
	maxTokens: 2048
}

export const glamaDefaultModelInfo: ModelInfo = {
	id: "llama-3.1-70b-versatile",
	name: "Llama 3.1 70B",
	contextWindow: 8192,
	maxTokens: 4096
}

export const requestyDefaultModelInfo: ModelInfo = {
	id: "claude-3-5-sonnet-20241022",
	name: "Claude 3.5 Sonnet",
	contextWindow: 200000,
	maxTokens: 8192
}

export const litellmDefaultModelInfo: ModelInfo = {
	id: "gpt-3.5-turbo",
	name: "GPT-3.5 Turbo",
	contextWindow: 4096,
	maxTokens: 2048
}

export const unboundDefaultModelInfo: ModelInfo = {
	id: "default",
	name: "Default Unbound Model",
	contextWindow: 4096,
	maxTokens: 2048
}

// Additional model defaults
export const geminiDefaultModelId = "gemini-1.5-pro-latest"
export const ollamaDefaultModelId = "llama2"
export const lmStudioDefaultModelId = "default"
export const litellmDefaultModelId = "gpt-3.5-turbo"
export const mistralDefaultModelId = "mistral-large-latest"
export const xaiDefaultModelId = "grok-beta"
export const groqDefaultModelId = "llama-3.1-70b-versatile"
export const fireworksDefaultModelId = "accounts/fireworks/models/llama-v3p1-70b-instruct"
export const deepSeekDefaultModelId = "deepseek-chat"
export const cerebrasDefaultModelId = "llama3.1-70b"
export const sambaNovaDefaultModelId = "Meta-Llama-3.1-70B-Instruct"
export const chutesDefaultModelId = "deepseek-chat"
export const zaiDefaultModelId = "gpt-4"
export const doubaoDefaultModelId = "ep-20241022"
export const moonshotDefaultModelId = "moonshot-v1-8k"
export const unboundDefaultModelId = "default"

// Additional missing default model IDs
export const vertexDefaultModelId = "claude-3-5-sonnet@20241022"
export const bedrockDefaultModelId = "anthropic.claude-3-5-sonnet-20241022-v2:0"
export const bedrockDefaultPromptRouterModelId = "us.anthropic.claude-3-5-sonnet-20241022-v2:0"

// Additional temperature constants
export const BEDROCK_DEFAULT_TEMPERATURE = 0
export const VERTEX_DEFAULT_TEMPERATURE = 0
export const GEMINI_DEFAULT_TEMPERATURE = 0

// Additional max tokens constants
export const BEDROCK_MAX_TOKENS = 8192
export const VERTEX_MAX_TOKENS = 8192
export const GEMINI_MAX_TOKENS = 8192

// Additional context window constants
export const BEDROCK_DEFAULT_CONTEXT = 200000
export const VERTEX_DEFAULT_CONTEXT = 200000
export const GEMINI_DEFAULT_CONTEXT = 200000

// API constants
export const DOUBAO_API_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
export const OPENAI_AZURE_AI_INFERENCE_PATH = "/chat/completions"

// AWS Bedrock constants
export const AWS_INFERENCE_PROFILE_MAPPING: Record<string, string> = {}

// LiteLLM constants
export const LITELLM_COMPUTER_USE_MODELS: string[] = []

// OpenRouter constants
export const OPEN_ROUTER_REQUIRED_REASONING_BUDGET_MODELS: string[] = []

// Verbosity level
export type VerbosityLevel = "low" | "medium" | "high"

// IPC types
export enum IpcMessageType {
	TASK_CREATED = "task_created",
	TASK_UPDATED = "task_updated",
	TASK_COMPLETED = "task_completed"
}

// Experiment types
export type ExperimentId = string

// Additional utility types
export type Keys<T> = keyof T
export type Values<T> = T[keyof T]
export type AssertEqual<T, U> = T extends U ? (U extends T ? true : false) : false
export type Equals<T, U> = AssertEqual<T, U>

// McP parameter schema
export const mcpParameterSchema = {
	type: "object",
	properties: {
		name: { type: "string" },
		description: { type: "string" },
		required: { type: "boolean" },
		type: { type: "string" }
	}
}

export const mcpInstallationMethodSchema = {
	type: "object",
	properties: {
		type: { enum: ["npm", "pip", "docker", "binary"] },
		command: { type: "string" }
	}
}

export const mcpMarketplaceItemSchema = {
	type: "object",
	properties: {
		id: { type: "string" },
		name: { type: "string" },
		description: { type: "string" },
		type: { enum: ["mcp"] },
		author: { type: "string" },
		version: { type: "string" },
		tags: { type: "array", items: { type: "string" } },
		installationMethod: mcpInstallationMethodSchema,
		parameters: { type: "array", items: mcpParameterSchema }
	}
}

export const modeMarketplaceItemSchema = {
	type: "object",
	properties: {
		id: { type: "string" },
		name: { type: "string" },
		description: { type: "string" },
		type: { enum: ["mode"] },
		author: { type: "string" },
		version: { type: "string" },
		tags: { type: "array", items: { type: "string" } }
	}
}

export interface McpParameter {
	name: string
	description: string
	required: boolean
	type: string
}

export interface McpInstallationMethod {
	type: "npm" | "pip" | "docker" | "binary"
	command: string
}

export interface McpMarketplaceItem extends MarketplaceItem {
	type: "mcp"
	installationMethod: McpInstallationMethod
	parameters: McpParameter[]
}

export interface OrganizationSettings {
	version?: number
	providerProfiles?: any[]
}

// API Handler Options interface
export interface ApiHandlerOptions {
	apiModelId?: string
	apiKey?: string
	apiBaseUrl?: string
	temperature?: number
	maxTokens?: number
	topP?: number
	topK?: number
	presencePenalty?: number
	frequencyPenalty?: number
	consecutiveMistakeLimit?: number
	includeMaxTokens?: boolean
	enableReasoningEffort?: boolean
	reasoningEffort?: boolean
	claudeCodeMaxOutputTokens?: number
	modelMaxTokens?: number
	// Additional missing properties from test files
	modelMaxThinkingTokens?: number
	anthropicUseAuthToken?: boolean
	awsRegion?: string
	awsCustomArn?: string
	awsUseCrossRegionInference?: boolean
	awsAccessKey?: string
	awsSecretKey?: string
	deepSeekBaseUrl?: string
	litellmUsePromptCache?: boolean
	mistralCodestralUrl?: string
	claudeCodePath?: string
	modelTemperature?: number
	// Additional AWS and provider-specific options
	bedrockRegion?: string
	vertexProjectId?: string
	vertexRegion?: string
	geminiApiKey?: string
	ollamaBaseUrl?: string
	lmStudioBaseUrl?: string
	glamaApiKey?: string
	requestyApiKey?: string
	litellmApiKey?: string
	litellmBaseUrl?: string
	mistralApiKey?: string
	xaiApiKey?: string
	groqApiKey?: string
	fireworksApiKey?: string
	cerebrasApiKey?: string
	sambaNovaApiKey?: string
	chutesApiKey?: string
	zaiApiKey?: string
	doubaoApiKey?: string
	moonshotApiKey?: string
	unboundApiKey?: string
}

// Model record type
export type ModelRecord = Record<string, ModelInfo>

// Support prompt type
export type SupportPromptType = "enhancement" | "condensing" | "custom"

// Install options interface
export interface InstallOptions {
	target?: "global" | "project"
	parameters?: Record<string, any>
}

// Exported mode config interface
export interface ExportedModeConfig {
	slug: string
	name: string
	description?: string
	roleDefinition?: string
	customInstructions?: string
	whenToUse?: string
	systemPrompt?: string
	tools?: string[]
	allowedFilePatterns?: string[]
	deniedFilePatterns?: string[]
	source?: "global" | "project"
}

// MCP Tool Call Response interface
export interface McpToolCallResponse {
	content: Array<{
		type: "text"
		text: string
	} | {
		type: "image"
		data: string
		mimeType: string
	} | {
		type: "audio"
		data: string
		mimeType: string
	} | {
		type: "resource"
		resource: {
			uri: string
			mimeType?: string
			text?: string
			blob?: string
		}
	}>
	isError?: boolean
}

// Additional missing types for modes
export interface GroupOptions {
	fileRegex?: string
	description?: string
	[key: string]: any
}

export type GroupEntry = ToolGroup | [ToolGroup, GroupOptions]

// Experiment IDs
export const EXPERIMENT_IDS = {
	multiFileApplyDiff: "multiFileApplyDiff",
	powerSteering: "powerSteering",
	preventFocusDisruption: "preventFocusDisruption",
	assistantMessageParser: "assistantMessageParser"
} as const

// Checkpoint types
export interface CheckpointDiffOptions {
	mode: "full" | "checkpoint"
	ts: number
	previousCommitHash?: string
	commitHash?: string
}

export interface CheckpointRestoreOptions {
	mode: "preview" | "restore"
	ts: number
	commitHash?: string
}

// Organization settings
export interface OrganizationSettings {
	version?: number
	providerProfiles?: any[]
}