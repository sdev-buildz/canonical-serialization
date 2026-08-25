<header>
  <h1 align="center">
    Canonical Serialization
  </h1 align="center">
</header>

## 🚀 Features

- Serializes objects into unique, deterministic, and deserializable strings, even with circular references.
- Compares objects using deep structural equality.
- Sorts object keys recursively to guarantee consistent output despite key reordering.
- Uses [serialize-javascript](https://www.npmjs.com/package/serialize-javascript) to handle Dates, RegExps, and functions.

## 📦 Installation

```sh
npm install canonical-serialization
```

## 💻 Usage Examples

### 🗂️ Sorts keys recursively. Serializes Dates, RegExps and functions.

```ts
import { canonicalSerialization } from 'canonical-serialization'

// keys of this object are unsorted
const obj1 = {
  b: 2,
  d: {
    // inside nested object
    g: () => {
      return 'lorem ipsum'
    },
    a: new Date(),
  },
  c: 1,
}

console.log(
  canonicalSerialization(obj1, { keepCircularReferences: false }, { space: 2 })
)
// Outputs:
// ({
//  "b": 2,
//  "c": 1,
//  "d": {
//    "a": new Date("2026-07-30T18:01:32.236Z"),
//    "g": ()=>{return"lorem ipsum"}
//  }
// })
// keys are sorted recursively. Dates are also serialized.
```

### 🔄 Serializes shared references (both circular and non-circular) by default. <a id="circular-references"></a>

```ts
const obj1 = { a: { c: {} as Record<string, unknown>, b: 2 } }
obj1.a.c = obj1

console.log(canonicalSerialization(obj1))
//  Outputs: ({"__csNodeId__":0,"value":{"a":{"__csNodeId__":1,"value":{"b":2,"c":{"__csNodeRef__":0}}}}})

//  You can disable serialization of shared references for more readable output.
console.log(canonicalSerialization(obj1), { keepCircularReferences: false })
//  Outputs: ({"a":{"b":2,"c":undefined}})
```

### 🔎 Deep structural equality comparison.

```ts
import { areStructurallyEqual } from "canonical-serialization";

const obj1 = {
 b: 2,
 a: {
   c: 1,
 },
 d: {
   g: "lorem ipsum",
   q: {
     m: "m",
     p: "p",
     n: "n",
     a: 5 as number | Record<string, unknown>,
   },
   a: 2 as number | Record<string, unknown>,
  },
};
obj1.d.a = obj1.a;  // adding circular references
obj1.d.q.a = obj1.d;

// This obj2 is structurally the same as obj1.
// But obj1 and obj2 do not share the same reference.
// The order of keys is also different.
const obj2 = structuralClone(obj1) as Partial<typeof obj1>;
obj2.delete a
// obj2.a is moved to last to change the order of keys.
obj2.a = structuralClone(obj1.a)

console.log(Object.is(obj1, obj2)) // Outputs: false

try {
 // Throws because of circular reference
 console.log(JSON.stringify(obj1) === JSON.stringify(obj2))
} catch (err) {
  console.error(err)
}

// Outputs: true
console.log(areStructurallyEqual(obj1, obj2))
```

### ↩ Deserialization

Use `deserialize` function to deserialize.

```ts
import { deserialize } from 'canonical-serialization'

const deserializedObject = deserialize(serializedString)
```

If [shared references](#circular-references) were not serialized,
[eval](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) also can be used.

### ⚠️ Security note — eval and untrusted input

`deserialize` uses eval to reconstruct values produced by canonicalSerialization (serialize-javascript can embed executable code for functions and similar values). This means the deserialization step will execute code contained in the serialized string. DO NOT call deserialize on input from untrusted sources. If you must accept untrusted data, avoid serializing functions or other executable values, or perform strict validation before deserializing. Consider providing or using a safer, non-executing format for untrusted input.

## ⚙️ canonicalSerialization - Function signature

```ts
canonicalSerialization(
  obj: unknown // THe object to be serialized.

  options?: {
    /**
     * Function used to determine the order of the elements.
     *  It is expected to return a negative value if the first argument is less than the second argument,
     *  zero if they're equal, and a positive value otherwise.
     */
    compareFn?: Parameters<Array<string>['sort']>[0]
    /** If true, throws when it detects any circular reference */
    throwOnCircularReference?: boolean
    /**
     * If true, circular references are serialized. They can be restored by `deserialize`.
     * Defaults to true, if this field is not set.
     */
    keepCircularReferences?: boolean
    /**
     * If true, non-circular shareds references are restored.
     * Defaults to false. But if keepCircularReferences is true, this also defaults to true.
     * If false, sibling references are resolved and replaced with a deep copy of the referenced object.
     */
    keepNonCircularReferences?: boolean
  },

  //  options forwarded to serializeJavascript.
  serializeJsOptions?: Readonly<Parameters<typeof serializeJavascript>[1]
): string
```

For more information on serializeJsOptions, refer the [official serialize-javascript documentation](<https://www.npmjs.com/package/serialize-javascript#:~:text=for%20straight%20serialization.-,Options,-The%20serialize()>).

## 👥 Community & Support

- 💬 _**Have an idea?**_ Suggest new features in [GitHub Discussions](../..//discussions).

- 🚀 _**Support me or my projects**_ through [donations](https://buymeacoffee.com/stevenx.dev).

- 💼 _**Need custom work or consultation?**_ I am available for hire! Reach out via [email](mailto:stevexdev@zohomail.in).
