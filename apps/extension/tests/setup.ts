import { vi } from "vitest";
Object.defineProperty(globalThis,"requestAnimationFrame",{value:(callback:FrameRequestCallback)=>setTimeout(()=>callback(performance.now()),0)});
Object.defineProperty(globalThis,"chrome",{value:{
  storage:{local:{get:vi.fn(),set:vi.fn(),remove:vi.fn()},onChanged:{addListener:vi.fn()}},
  runtime:{sendMessage:vi.fn(),onInstalled:{addListener:vi.fn()},onMessage:{addListener:vi.fn()}},
  identity:{},
  tabs:{create:vi.fn()},
  action:{onClicked:{addListener:vi.fn()}},
  notifications:{create:vi.fn()},
  alarms:{create:vi.fn(),onAlarm:{addListener:vi.fn()}},
  declarativeNetRequest:{
    getSessionRules:vi.fn(),
    updateSessionRules:vi.fn(),
    RuleActionType:{BLOCK:"block"},
    ResourceType:{IMAGE:"image"},
  },
},configurable:true});
