import type { StoredEmail } from "../types";
export type ComposeSnapshot={subject:string;recipients:string[];body:HTMLElement;sendButton:HTMLElement};
export interface WebmailProvider{start():void;stop():void;renderStatuses(emails:StoredEmail[]):void}
