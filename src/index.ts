import {
  ProtoMessage,
  ProtoField,
  ProtoPrimitiveMap,
  ProtoPrimitive,
} from './models/models_pb'
import { parseProtoField } from './parse_proto_field'

export function parseRootObjectToProtoMessage(
  obj: object,
  name = 'Root',
): ProtoMessage {
  const root = new ProtoMessage()

  root.setName(name)

  Object.keys(obj).forEach((key, idx) => {
    root.addFields(parseProtoField((obj as any)[key], key, idx + 1))
  })

  return root
}

/**
 * Converts ProtoMessage to Proto definition
 *
 * For example, the following is the example output.
 *
 * message Root {
 *   string key_name = 1;
 * }
 */
export function convertProtoMessageToString(
  protoMessage: ProtoMessage,
): string {
  return `
message ${protoMessage.getName()} {
${convertProtoFields(protoMessage.getFieldsList(), /*depth=*/ 1)}
}`
}

/**
 * Converts ProtoField[] to string
 *
 * @param protoFields ProtoField[]
 * @param depth The depth of 1 means the fields of the root object. Hence, it
 * needs to be indented with 2 spaces. For example,
 *
 * message Root {
 *   string key_name = 1; // notice there are 2 spaces in this line.
 * }
 *
 * @returns string
 */
function convertProtoFields(protoFields: ProtoField[], depth: number): string {
  const prefix = '  '.repeat(depth)
  return protoFields
    .map(protoField => prefix + convertProtoField(protoField))
    .join('\n')
}

/**
 * Converts a single ProtoField into string
 *
 * Currently, it only supports primitive types.
 *
 * TODO: Support embedded types.
 */
function convertProtoField(protoField: ProtoField): string {
  if (protoField.getType()?.hasProtoTypePrimitive()) {
    let prefix = protoField.getRepeated() ? 'repeated ' : ''

    const protoFieldType = getProtoTypePrimitiveName(
      protoField.getType()!.getProtoTypePrimitive(),
    )

    return `${prefix}${protoFieldType} ${protoField.getName()} = ${protoField.getTag()};`
  }

  // protoField.getType()?.hasProtoTypeMessage()
  throw new TypeError(
    'ProtoTypeMessage is currently not supported for conversion',
  )
}

function getProtoTypePrimitiveName(
  protoTypePrimitive: ProtoPrimitiveMap[keyof ProtoPrimitiveMap],
): string {
  switch (protoTypePrimitive) {
    case ProtoPrimitive.PROTO_PRIMITIVE_STRING:
      return 'string'
    case ProtoPrimitive.PROTO_PRIMITIVE_BOOL:
      return 'bool'
    case ProtoPrimitive.PROTO_PRIMITIVE_INT64:
      return 'int64'
    case ProtoPrimitive.PROTO_PRIMITIVE_DOUBLE:
      return 'double'
    case ProtoPrimitive.PROTO_PRIMITIVE_UNKNOWN:
      return 'unknown'
  }
}
