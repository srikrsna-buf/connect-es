/* eslint-disable */
// @generated by protoc-gen-connect-web v0.0.3 with parameter "ts_nocheck=false,target=ts"
// @generated from file buf/alpha/registry/v1alpha1/push.proto (package buf.alpha.registry.v1alpha1, syntax proto3)
//
// Copyright 2020-2022 Buf Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {PushRequest, PushResponse} from "./push_pb.js";
import {MethodKind} from "@bufbuild/protobuf";

/**
 * PushService is the Push service.
 *
 * @generated from service buf.alpha.registry.v1alpha1.PushService
 */
export const PushService = {
  typeName: "buf.alpha.registry.v1alpha1.PushService",
  methods: {
    /**
     * Push pushes.
     *
     * @generated from rpc buf.alpha.registry.v1alpha1.PushService.Push
     */
    push: {
      name: "Push",
      I: PushRequest,
      O: PushResponse,
      kind: MethodKind.Unary,
    },
  }
} as const;

