/* global mocha, describe, it */
/* global chai, assert, assertEquals, assertMatch */
/* global Deno */
/* global OTPAuth */

(async () => {
  /* ================================================
   * Initialize environment
   * ================================================
   */

  const context = (() => {
    if (typeof globalThis !== "undefined") return globalThis;
    if (typeof global !== "undefined") return global;
    if (typeof window !== "undefined") return window;
    if (typeof self !== "undefined") return self;
    return this;
  })();

  const isNode =
    Object.prototype.toString.call(context.process) === "[object process]";
  const isDeno = "Deno" in context && Deno.version && Deno.version.deno;

  try {
    if (!("mocha" in context)) {
      if (isDeno) {
        await import("../node_modules/mocha/mocha.js");
      }
    }

    if (!("chai" in context)) {
      if (isNode) {
        context.chai = require("chai");
      } else if (isDeno) {
        await import("../node_modules/chai/chai.js");
      }
    }

    if (!("describe" in context) || !("it" in context)) {
      mocha.setup({ ui: "bdd", reporter: "spec" });
      context.mochaSelfSetup = true;
    }

    if (!("OTPAuth" in context)) {
      if (isNode) {
        context.OTPAuth = require(process.env.MINIFIED === "true"
          ? "../dist/otpauth.cjs.min.js"
          : "../dist/otpauth.cjs.js");
      } else if (isDeno) {
        context.OTPAuth = await import(
          Deno.env.get("MINIFIED") === "true"
            ? "../dist/otpauth.esm.min.js"
            : "../dist/otpauth.esm.js"
        );
      }
    }

    context.assert = chai.assert;
    context.assertEquals = chai.assert.deepEqual;
    context.assertMatch = chai.assert.match;
  } catch (err) {
    console.error(err);
    if (isNode) process.exit(1);
    else if (isDeno) Deno.exit(1);
  }

  /* ================================================
   * Test cases
   * ================================================
   */

  const cases = [
    {
      // 00
      buffer: new Uint8Array([
        243, 173, 139, 162, 223, 129, 48, 125, 241, 133, 184, 133, 119, 230,
        129, 128, 230, 139, 134, 87, 233, 158, 171, 241, 146, 166, 173, 230,
        156, 173, 198, 134, 233, 146, 170, 235, 144, 186, 221, 187, 217, 131,
        227, 183, 144, 57, 240, 177, 183, 128, 44, 243, 150, 159, 159, 242, 141,
        184, 130, 196, 144, 232, 172, 180, 240, 182, 148, 149, 225, 139, 152,
        78, 212, 181, 242, 157, 183, 180, 241, 128, 181, 148, 211, 188,
      ]).buffer,
      latin1:
        "\u00F3\u00AD\u008B\u00A2\u00DF\u0081\u0030\u007D\u00F1\u0085\u00B8\u0085\u0077\u00E6\u0081\u0080\u00E6\u008B\u0086\u0057\u00E9\u009E\u00AB\u00F1\u0092\u00A6\u00AD\u00E6\u009C\u00AD\u00C6\u0086\u00E9\u0092\u00AA\u00EB\u0090\u00BA\u00DD\u00BB\u00D9\u0083\u00E3\u00B7\u0090\u0039\u00F0\u00B1\u00B7\u0080\u002C\u00F3\u0096\u009F\u009F\u00F2\u008D\u00B8\u0082\u00C4\u0090\u00E8\u00AC\u00B4\u00F0\u00B6\u0094\u0095\u00E1\u008B\u0098\u004E\u00D4\u00B5\u00F2\u009D\u00B7\u00B4\u00F1\u0080\u00B5\u0094\u00D3\u00BC",
      utf8: "\uDB74\uDEE2\u07C1\u0030\u007D\uD8D7\uDE05\u0077\u6040\u62C6\u0057\u97AB\uD90A\uDDAD\u672D\u0186\u94AA\uB43A\u077B\u0643\u3DD0\u0039\uD887\uDDC0\u002C\uDB19\uDFDF\uD9F7\uDE02\u0110\u8B34\uD899\uDD15\u12D8\u004E\u0535\uDA37\uDDF4\uD8C3\uDD54\u04FC",
      base32:
        "6OWYXIW7QEYH34MFXCCXPZUBQDTIXBSX5GPKX4MSU2W6NHFNY2DOTEVK5OILVXN33GB6HN4QHHYLDN4AFTZZNH476KG3RAWESDUKZNHQW2KJLYMLTBHNJNPSTW33J4MAWWKNHPA",
      hex: "F3AD8BA2DF81307DF185B88577E68180E68B8657E99EABF192A6ADE69CADC686E992AAEB90BADDBBD983E3B79039F0B1B7802CF3969F9FF28DB882C490E8ACB4F0B69495E18B984ED4B5F29DB7B4F180B594D3BC",
      hotp: {
        constructor: {
          input: { algorithm: "SHA1" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "147664",
        },
        validate: {
          input: { token: "147664", counter: 1e10 - 90, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=6OWYXIW7QEYH34MFXCCXPZUBQDTIXBSX5GPKX4MSU2W6NHFNY2DOTEVK5OILVXN33GB6HN4QHHYLDN4AFTZZNH476KG3RAWESDUKZNHQW2KJLYMLTBHNJNPSTW33J4MAWWKNHPA&algorithm=SHA1&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { algorithm: "SHA1", period: 5 },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "757316",
        },
        validate: {
          input: { token: "757316", timestamp: 1451606395000 },
          output: 1,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=6OWYXIW7QEYH34MFXCCXPZUBQDTIXBSX5GPKX4MSU2W6NHFNY2DOTEVK5OILVXN33GB6HN4QHHYLDN4AFTZZNH476KG3RAWESDUKZNHQW2KJLYMLTBHNJNPSTW33J4MAWWKNHPA&algorithm=SHA1&digits=6&period=5",
        },
      },
    },
    {
      // 01
      buffer: new Uint8Array([
        38, 206, 190, 44, 118, 226, 178, 189, 230, 189, 139, 237, 151, 165, 240,
        159, 148, 149, 216, 161, 45, 225, 163, 164, 242, 190, 149, 150, 200,
        128, 242, 169, 179, 146, 49, 198, 147, 243, 177, 165, 153, 240, 190,
        130, 171, 38, 194, 148, 232, 175, 145, 241, 184, 170, 148, 228, 160,
        135, 240, 146, 183, 185, 98, 68, 215, 181, 222, 181, 209, 171, 234, 187,
        177, 198, 182, 231, 185, 176,
      ]).buffer,
      latin1:
        "\u0026\u00CE\u00BE\u002C\u0076\u00E2\u00B2\u00BD\u00E6\u00BD\u008B\u00ED\u0097\u00A5\u00F0\u009F\u0094\u0095\u00D8\u00A1\u002D\u00E1\u00A3\u00A4\u00F2\u00BE\u0095\u0096\u00C8\u0080\u00F2\u00A9\u00B3\u0092\u0031\u00C6\u0093\u00F3\u00B1\u00A5\u0099\u00F0\u00BE\u0082\u00AB\u0026\u00C2\u0094\u00E8\u00AF\u0091\u00F1\u00B8\u00AA\u0094\u00E4\u00A0\u0087\u00F0\u0092\u00B7\u00B9\u0062\u0044\u00D7\u00B5\u00DE\u00B5\u00D1\u00AB\u00EA\u00BB\u00B1\u00C6\u00B6\u00E7\u00B9\u00B0",
      utf8: "\u0026\u03BE\u002C\u0076\u2CBD\u6F4B\uD5E5\uD83D\uDD15\u0621\u002D\u18E4\uDAB9\uDD56\u0200\uDA67\uDCD2\u0031\u0193\uDB86\uDD59\uD8B8\uDCAB\u0026\u0094\u8BD1\uD9A2\uDE94\u4807\uD80B\uDDF9\u0062\u0044\u05F5\u07B5\u046B\uAEF1\u01B6\u7E70",
      base32:
        "E3HL4LDW4KZL3ZV5RPWZPJPQT6KJLWFBFXQ2HJHSX2KZNSEA6KU3HERRY2J7HMNFTHYL5AVLE3BJJ2FPSHY3RKUU4SQIP4ESW64WERGXWXPLLUNL5K53DRVW4643A",
      hex: "26CEBE2C76E2B2BDE6BD8BED97A5F09F9495D8A12DE1A3A4F2BE9596C880F2A9B39231C693F3B1A599F0BE82AB26C294E8AF91F1B8AA94E4A087F092B7B96244D7B5DEB5D1ABEABBB1C6B6E7B9B0",
      hotp: {
        constructor: {
          input: { algorithm: "SHA256" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "789391",
        },
        validate: {
          input: { token: "789391", counter: 1e10 - 90, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=E3HL4LDW4KZL3ZV5RPWZPJPQT6KJLWFBFXQ2HJHSX2KZNSEA6KU3HERRY2J7HMNFTHYL5AVLE3BJJ2FPSHY3RKUU4SQIP4ESW64WERGXWXPLLUNL5K53DRVW4643A&algorithm=SHA256&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { algorithm: "SHA256", period: 10 },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "043840",
        },
        validate: {
          input: { token: "043840", timestamp: 1451606410000 },
          output: -1,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=E3HL4LDW4KZL3ZV5RPWZPJPQT6KJLWFBFXQ2HJHSX2KZNSEA6KU3HERRY2J7HMNFTHYL5AVLE3BJJ2FPSHY3RKUU4SQIP4ESW64WERGXWXPLLUNL5K53DRVW4643A&algorithm=SHA256&digits=6&period=10",
        },
      },
    },
    {
      // 02
      buffer: new Uint8Array([
        243, 169, 171, 133, 237, 140, 179, 49, 221, 146, 231, 170, 164, 242,
        162, 152, 181, 236, 132, 169, 121, 232, 173, 172, 241, 188, 139, 175,
        227, 139, 143, 239, 191, 189, 233, 169, 169, 221, 172, 226, 147, 140,
        194, 189, 227, 149, 131, 244, 135, 184, 130, 236, 176, 151, 243, 188,
        180, 145, 241, 159, 132, 134, 210, 175, 240, 156, 144, 151, 240, 159,
        154, 159, 66, 240, 148, 156, 168, 241, 180, 153, 167, 217, 188, 233,
        145, 178, 243, 184, 131, 168, 235, 150, 186, 242, 139, 131, 137,
      ]).buffer,
      latin1:
        "\u00F3\u00A9\u00AB\u0085\u00ED\u008C\u00B3\u0031\u00DD\u0092\u00E7\u00AA\u00A4\u00F2\u00A2\u0098\u00B5\u00EC\u0084\u00A9\u0079\u00E8\u00AD\u00AC\u00F1\u00BC\u008B\u00AF\u00E3\u008B\u008F\u00EF\u00BF\u00BD\u00E9\u00A9\u00A9\u00DD\u00AC\u00E2\u0093\u008C\u00C2\u00BD\u00E3\u0095\u0083\u00F4\u0087\u00B8\u0082\u00EC\u00B0\u0097\u00F3\u00BC\u00B4\u0091\u00F1\u009F\u0084\u0086\u00D2\u00AF\u00F0\u009C\u0090\u0097\u00F0\u009F\u009A\u009F\u0042\u00F0\u0094\u009C\u00A8\u00F1\u00B4\u0099\u00A7\u00D9\u00BC\u00E9\u0091\u00B2\u00F3\u00B8\u0083\u00A8\u00EB\u0096\u00BA\u00F2\u008B\u0083\u0089",
      utf8: "\uDB66\uDEC5\uD333\u0031\u0752\u7AA4\uDA49\uDE35\uC129\u0079\u8B6C\uD9B0\uDEEF\u32CF\uFFFD\u9A69\u076C\u24CC\u00BD\u3543\uDBDF\uDE02\uCC17\uDBB3\uDD11\uD93C\uDD06\u04AF\uD831\uDC17\uD83D\uDE9F\u0042\uD811\uDF28\uD991\uDE67\u067C\u9472\uDBA0\uDCE8\uB5BA\uD9EC\uDCC9",
      base32:
        "6OU2XBPNRSZTDXMS46VKJ4VCTC26ZBFJPHUK3LHRXSF27Y4LR7X37PPJVGU53LHCSOGMFPPDSWB7JB5YQLWLBF7TXS2JD4M7QSDNFL7QTSIJP4E7TKPUF4EUTSUPDNEZU7M3Z2MRWLZ3RA5I5OLLV4ULQOEQ",
      hex: "F3A9AB85ED8CB331DD92E7AAA4F2A298B5EC84A979E8ADACF1BC8BAFE38B8FEFBFBDE9A9A9DDACE2938CC2BDE39583F487B882ECB097F3BCB491F19F8486D2AFF09C9097F09F9A9F42F0949CA8F1B499A7D9BCE991B2F3B883A8EB96BAF28B8389",
      hotp: {
        constructor: {
          input: { algorithm: "SHA512" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "363952",
        },
        validate: {
          input: { token: "363952", counter: 1e10 - 90, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=6OU2XBPNRSZTDXMS46VKJ4VCTC26ZBFJPHUK3LHRXSF27Y4LR7X37PPJVGU53LHCSOGMFPPDSWB7JB5YQLWLBF7TXS2JD4M7QSDNFL7QTSIJP4E7TKPUF4EUTSUPDNEZU7M3Z2MRWLZ3RA5I5OLLV4ULQOEQ&algorithm=SHA512&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { algorithm: "SHA512", period: 15 },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "665593",
        },
        validate: {
          input: { token: "665593", timestamp: 1451606385000, window: 0 },
          output: null,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=6OU2XBPNRSZTDXMS46VKJ4VCTC26ZBFJPHUK3LHRXSF27Y4LR7X37PPJVGU53LHCSOGMFPPDSWB7JB5YQLWLBF7TXS2JD4M7QSDNFL7QTSIJP4E7TKPUF4EUTSUPDNEZU7M3Z2MRWLZ3RA5I5OLLV4ULQOEQ&algorithm=SHA512&digits=6&period=15",
        },
      },
    },
    {
      // 03
      buffer: new Uint8Array([
        116, 124, 238, 134, 154, 200, 135, 231, 188, 137, 243, 131, 165, 170,
        221, 149, 233, 159, 173, 44, 242, 165, 182, 143, 239, 191, 189, 204,
        186, 118, 203, 177, 228, 165, 186, 226, 175, 182, 232, 175, 171, 231,
        176, 131, 241, 187, 188, 137, 45, 45, 215, 152, 229, 151, 142, 241, 134,
        173, 128, 243, 135, 165, 187, 227, 143, 183, 232, 137, 142, 32, 243,
        169, 151, 136, 213, 167, 243, 163, 156, 155, 226, 151, 163,
      ]).buffer,
      latin1:
        "\u0074\u007C\u00EE\u0086\u009A\u00C8\u0087\u00E7\u00BC\u0089\u00F3\u0083\u00A5\u00AA\u00DD\u0095\u00E9\u009F\u00AD\u002C\u00F2\u00A5\u00B6\u008F\u00EF\u00BF\u00BD\u00CC\u00BA\u0076\u00CB\u00B1\u00E4\u00A5\u00BA\u00E2\u00AF\u00B6\u00E8\u00AF\u00AB\u00E7\u00B0\u0083\u00F1\u00BB\u00BC\u0089\u002D\u002D\u00D7\u0098\u00E5\u0097\u008E\u00F1\u0086\u00AD\u0080\u00F3\u0087\u00A5\u00BB\u00E3\u008F\u00B7\u00E8\u0089\u008E\u0020\u00F3\u00A9\u0097\u0088\u00D5\u00A7\u00F3\u00A3\u009C\u009B\u00E2\u0097\u00A3",
      utf8: "\u0074\u007C\uE19A\u0207\u7F09\uDACE\uDD6A\u0755\u97ED\u002C\uDA57\uDD8F\uFFFD\u033A\u0076\u02F1\u497A\u2BF6\u8BEB\u7C03\uD9AF\uDF09\u002D\u002D\u05D8\u55CE\uD8DA\uDF40\uDADE\uDD7B\u33F7\u824E\u0020\uDB65\uDDC8\u0567\uDB4D\uDF1B\u25E3",
      base32:
        "OR6O5BU2ZCD6PPEJ6OB2LKW5SXUZ7LJM6KS3ND7PX664ZOTWZOY6JJN24KX3N2FPVPT3BA7RXO6ISLJN26MOLF4O6GDK3AHTQ6S3XY4PW7UITDRA6OUZPCGVU7Z2HHE34KL2G",
      hex: "747CEE869AC887E7BC89F383A5AADD95E99FAD2CF2A5B68FEFBFBDCCBA76CBB1E4A5BAE2AFB6E8AFABE7B083F1BBBC892D2DD798E5978EF186AD80F387A5BBE38FB7E8898E20F3A99788D5A7F3A39C9BE297A3",
      hotp: {
        constructor: {
          input: { digits: 6, issuer: "ACME" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "361593",
        },
        validate: {
          input: { token: "361593", counter: 0 },
          output: null,
        },
        toString: {
          output:
            "otpauth://hotp/ACME:OTPAuth?issuer=ACME&secret=OR6O5BU2ZCD6PPEJ6OB2LKW5SXUZ7LJM6KS3ND7PX664ZOTWZOY6JJN24KX3N2FPVPT3BA7RXO6ISLJN26MOLF4O6GDK3AHTQ6S3XY4PW7UITDRA6OUZPCGVU7Z2HHE34KL2G&algorithm=SHA1&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { digits: 6, issuer: "ACME" },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "329537",
        },
        validate: {
          input: { token: "329537", timestamp: 0 },
          output: null,
        },
        toString: {
          output:
            "otpauth://totp/ACME:OTPAuth?issuer=ACME&secret=OR6O5BU2ZCD6PPEJ6OB2LKW5SXUZ7LJM6KS3ND7PX664ZOTWZOY6JJN24KX3N2FPVPT3BA7RXO6ISLJN26MOLF4O6GDK3AHTQ6S3XY4PW7UITDRA6OUZPCGVU7Z2HHE34KL2G&algorithm=SHA1&digits=6&period=30",
        },
      },
    },
    {
      // 04
      buffer: new Uint8Array([
        200, 188, 113, 228, 181, 129, 207, 169, 217, 142, 240, 171, 188, 190,
        241, 169, 173, 176, 198, 167, 241, 180, 145, 185, 226, 182, 187, 213,
        133, 214, 169, 238, 136, 139, 224, 164, 146, 200, 128, 214, 149, 227,
        189, 163, 231, 177, 137, 215, 141, 198, 170, 207, 155, 230, 171, 186,
        33, 242, 131, 172, 188, 54, 201, 187, 235, 128, 185, 97, 197, 134, 240,
        171, 165, 165, 222, 181, 50,
      ]).buffer,
      latin1:
        "\u00C8\u00BC\u0071\u00E4\u00B5\u0081\u00CF\u00A9\u00D9\u008E\u00F0\u00AB\u00BC\u00BE\u00F1\u00A9\u00AD\u00B0\u00C6\u00A7\u00F1\u00B4\u0091\u00B9\u00E2\u00B6\u00BB\u00D5\u0085\u00D6\u00A9\u00EE\u0088\u008B\u00E0\u00A4\u0092\u00C8\u0080\u00D6\u0095\u00E3\u00BD\u00A3\u00E7\u00B1\u0089\u00D7\u008D\u00C6\u00AA\u00CF\u009B\u00E6\u00AB\u00BA\u0021\u00F2\u0083\u00AC\u00BC\u0036\u00C9\u00BB\u00EB\u0080\u00B9\u0061\u00C5\u0086\u00F0\u00AB\u00A5\u00A5\u00DE\u00B5\u0032",
      utf8: "\u023C\u0071\u4D41\u03E9\u064E\uD86F\uDF3E\uD966\uDF70\u01A7\uD991\uDC79\u2DBB\u0545\u05A9\uE20B\u0912\u0200\u0595\u3F63\u7C49\u05CD\u01AA\u03DB\u6AFA\u0021\uD9CE\uDF3C\u0036\u027B\uB039\u0061\u0146\uD86E\uDD65\u07B5\u0032",
      base32:
        "ZC6HDZFVQHH2TWMO6CV3ZPXRVGW3BRVH6G2JDOPCW255LBOWVHXIRC7AUSJMRAGWSXR33I7HWGE5PDOGVLHZXZVLXIQ7FA5MXQ3MTO7LQC4WDRMG6CV2LJO6WUZA",
      hex: "C8BC71E4B581CFA9D98EF0ABBCBEF1A9ADB0C6A7F1B491B9E2B6BBD585D6A9EE888BE0A492C880D695E3BDA3E7B189D78DC6AACF9BE6ABBA21F283ACBC36C9BBEB80B961C586F0ABA5A5DEB532",
      hotp: {
        constructor: {
          input: { digits: 7, label: "Username" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "8319983",
        },
        validate: {
          input: { token: "8319983", counter: 0 },
          output: null,
        },
        toString: {
          output:
            "otpauth://hotp/Username?secret=ZC6HDZFVQHH2TWMO6CV3ZPXRVGW3BRVH6G2JDOPCW255LBOWVHXIRC7AUSJMRAGWSXR33I7HWGE5PDOGVLHZXZVLXIQ7FA5MXQ3MTO7LQC4WDRMG6CV2LJO6WUZA&algorithm=SHA1&digits=7&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { digits: 7, label: "Username" },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "0565981",
        },
        validate: {
          input: { token: "0565981", timestamp: 0 },
          output: null,
        },
        toString: {
          output:
            "otpauth://totp/Username?secret=ZC6HDZFVQHH2TWMO6CV3ZPXRVGW3BRVH6G2JDOPCW255LBOWVHXIRC7AUSJMRAGWSXR33I7HWGE5PDOGVLHZXZVLXIQ7FA5MXQ3MTO7LQC4WDRMG6CV2LJO6WUZA&algorithm=SHA1&digits=7&period=30",
        },
      },
    },
    {
      // 05
      buffer: new Uint8Array([
        38, 218, 173, 95, 229, 180, 182, 230, 167, 161, 124, 243, 178, 143, 176,
        216, 172, 209, 140, 117, 240, 186, 184, 136, 241, 171, 133, 165, 232,
        135, 174, 231, 147, 139, 94, 235, 156, 157, 51, 242, 182, 143, 176, 241,
        175, 179, 170, 43, 212, 172, 241, 137, 185, 143, 240, 178, 187, 155,
        240, 146, 176, 148, 239, 136, 162, 219, 134, 241, 137, 162, 131, 226,
        135, 183, 227, 151, 173, 56, 229, 134, 149, 242, 164, 152, 138,
      ]).buffer,
      latin1:
        "\u0026\u00DA\u00AD\u005F\u00E5\u00B4\u00B6\u00E6\u00A7\u00A1\u007C\u00F3\u00B2\u008F\u00B0\u00D8\u00AC\u00D1\u008C\u0075\u00F0\u00BA\u00B8\u0088\u00F1\u00AB\u0085\u00A5\u00E8\u0087\u00AE\u00E7\u0093\u008B\u005E\u00EB\u009C\u009D\u0033\u00F2\u00B6\u008F\u00B0\u00F1\u00AF\u00B3\u00AA\u002B\u00D4\u00AC\u00F1\u0089\u00B9\u008F\u00F0\u00B2\u00BB\u009B\u00F0\u0092\u00B0\u0094\u00EF\u0088\u00A2\u00DB\u0086\u00F1\u0089\u00A2\u0083\u00E2\u0087\u00B7\u00E3\u0097\u00AD\u0038\u00E5\u0086\u0095\u00F2\u00A4\u0098\u008A",
      utf8: "\u0026\u06AD\u005F\u5D36\u69E1\u007C\uDB88\uDFF0\u062C\u044C\u0075\uD8AB\uDE08\uD96C\uDD65\u81EE\u74CB\u005E\uB71D\u0033\uDA98\uDFF0\uD97F\uDCEA\u002B\u052C\uD8E7\uDE4F\uD88B\uDEDB\uD80B\uDC14\uF222\u06C6\uD8E6\uDC83\u21F7\u35ED\u0038\u5195\uDA51\uDE0A",
      base32:
        "E3NK2X7FWS3ONJ5BPTZ3FD5Q3CWNDDDV6C5LRCHRVOC2L2EHV3TZHC265OOJ2M7SW2H3B4NPWOVCXVFM6GE3TD7QWK5ZX4ESWCKO7CFC3ODPDCNCQPRIPN7DS6WTRZMGSXZKJGEK",
      hex: "26DAAD5FE5B4B6E6A7A17CF3B28FB0D8ACD18C75F0BAB888F1AB85A5E887AEE7938B5EEB9C9D33F2B68FB0F1AFB3AA2BD4ACF189B98FF0B2BB9BF092B094EF88A2DB86F189A283E287B7E397AD38E58695F2A4988A",
      hotp: {
        constructor: {
          input: { digits: 8, issuer: "ACME Co", label: "Firstname Lastname" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "94726517",
        },
        validate: {
          input: { token: "94726517", counter: 0 },
          output: null,
        },
        toString: {
          output:
            "otpauth://hotp/ACME%20Co:Firstname%20Lastname?issuer=ACME%20Co&secret=E3NK2X7FWS3ONJ5BPTZ3FD5Q3CWNDDDV6C5LRCHRVOC2L2EHV3TZHC265OOJ2M7SW2H3B4NPWOVCXVFM6GE3TD7QWK5ZX4ESWCKO7CFC3ODPDCNCQPRIPN7DS6WTRZMGSXZKJGEK&algorithm=SHA1&digits=8&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { digits: 8, issuer: "ACME Co", label: "Firstname Lastname" },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "29100432",
        },
        validate: {
          input: { token: "29100432", timestamp: 0 },
          output: null,
        },
        toString: {
          output:
            "otpauth://totp/ACME%20Co:Firstname%20Lastname?issuer=ACME%20Co&secret=E3NK2X7FWS3ONJ5BPTZ3FD5Q3CWNDDDV6C5LRCHRVOC2L2EHV3TZHC265OOJ2M7SW2H3B4NPWOVCXVFM6GE3TD7QWK5ZX4ESWCKO7CFC3ODPDCNCQPRIPN7DS6WTRZMGSXZKJGEK&algorithm=SHA1&digits=8&period=30",
        },
      },
    },
    {
      // 06
      buffer: new Uint8Array([
        243, 183, 140, 146, 218, 181, 242, 169, 140, 159, 216, 150, 197, 166,
        196, 147, 239, 190, 159, 91, 227, 128, 171, 230, 141, 144, 244, 131,
        133, 143, 236, 183, 171, 68, 228, 170, 159, 85, 203, 181, 241, 133, 136,
        146, 240, 165, 152, 133, 224, 161, 162, 232, 184, 172, 244, 131, 184,
        181, 80, 243, 168, 164, 145, 232, 155, 169, 225, 165, 146, 82, 236, 191,
        172, 206, 181, 239, 191, 189, 240, 167, 130, 187, 37, 106,
      ]).buffer,
      latin1:
        "\u00F3\u00B7\u008C\u0092\u00DA\u00B5\u00F2\u00A9\u008C\u009F\u00D8\u0096\u00C5\u00A6\u00C4\u0093\u00EF\u00BE\u009F\u005B\u00E3\u0080\u00AB\u00E6\u008D\u0090\u00F4\u0083\u0085\u008F\u00EC\u00B7\u00AB\u0044\u00E4\u00AA\u009F\u0055\u00CB\u00B5\u00F1\u0085\u0088\u0092\u00F0\u00A5\u0098\u0085\u00E0\u00A1\u00A2\u00E8\u00B8\u00AC\u00F4\u0083\u00B8\u00B5\u0050\u00F3\u00A8\u00A4\u0091\u00E8\u009B\u00A9\u00E1\u00A5\u0092\u0052\u00EC\u00BF\u00AC\u00CE\u00B5\u00EF\u00BF\u00BD\u00F0\u00A7\u0082\u00BB\u0025\u006A",
      utf8: "\uDB9C\uDF12\u06B5\uDA64\uDF1F\u0616\u0166\u0113\uFF9F\u005B\u302B\u6350\uDBCC\uDD4F\uCDEB\u0044\u4A9F\u0055\u02F5\uD8D4\uDE12\uD855\uDE05\u0862\u8E2C\uDBCF\uDE35\u0050\uDB62\uDD11\u86E9\u1952\u0052\uCFEC\u03B5\uFFFD\uD85C\uDCBB\u0025\u006A",
      base32:
        "6O3YZEW2WXZKTDE73CLMLJWESPX35H234OAKXZUNSD2IHBMP5S32WRHEVKPVLS5V6GCYREXQUWMILYFBULULRLHUQO4LKUHTVCSJD2E3VHQ2LESS5S72ZTVV567334FHQK5SK2Q",
      hex: "F3B78C92DAB5F2A98C9FD896C5A6C493EFBE9F5BE380ABE68D90F483858FECB7AB44E4AA9F55CBB5F1858892F0A59885E0A1A2E8B8ACF483B8B550F3A8A491E89BA9E1A59252ECBFACCEB5EFBFBDF0A782BB256A",
      hotp: {
        constructor: {
          input: {},
        },
        generate: {
          input: { counter: 1e10 },
          output: "606594",
        },
        validate: {
          input: { token: "606594", counter: 1e10 + 1 },
          output: -1,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=6O3YZEW2WXZKTDE73CLMLJWESPX35H234OAKXZUNSD2IHBMP5S32WRHEVKPVLS5V6GCYREXQUWMILYFBULULRLHUQO4LKUHTVCSJD2E3VHQ2LESS5S72ZTVV567334FHQK5SK2Q&algorithm=SHA1&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: {},
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "724410",
        },
        validate: {
          input: { token: "724410", timestamp: 1451603700000, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=6O3YZEW2WXZKTDE73CLMLJWESPX35H234OAKXZUNSD2IHBMP5S32WRHEVKPVLS5V6GCYREXQUWMILYFBULULRLHUQO4LKUHTVCSJD2E3VHQ2LESS5S72ZTVV567334FHQK5SK2Q&algorithm=SHA1&digits=6&period=30",
        },
      },
    },
    {
      // 07
      buffer: new Uint8Array([
        240, 157, 140, 131, 229, 136, 138, 196, 179, 216, 134, 243, 135, 132,
        166, 78, 233, 174, 139, 235, 135, 131, 199, 188, 202, 144, 99, 230, 169,
        141, 234, 179, 180, 42, 82, 233, 139, 172, 237, 133, 144, 206, 150, 220,
        151, 243, 185, 145, 160, 240, 172, 129, 166, 232, 187, 168, 102, 198,
        183, 218, 168, 230, 155, 176, 114, 196, 141, 241, 149, 173, 169, 230,
        173, 144, 242, 186, 151, 176, 236, 163, 136,
      ]).buffer,
      latin1:
        "\u00F0\u009D\u008C\u0083\u00E5\u0088\u008A\u00C4\u00B3\u00D8\u0086\u00F3\u0087\u0084\u00A6\u004E\u00E9\u00AE\u008B\u00EB\u0087\u0083\u00C7\u00BC\u00CA\u0090\u0063\u00E6\u00A9\u008D\u00EA\u00B3\u00B4\u002A\u0052\u00E9\u008B\u00AC\u00ED\u0085\u0090\u00CE\u0096\u00DC\u0097\u00F3\u00B9\u0091\u00A0\u00F0\u00AC\u0081\u00A6\u00E8\u00BB\u00A8\u0066\u00C6\u00B7\u00DA\u00A8\u00E6\u009B\u00B0\u0072\u00C4\u008D\u00F1\u0095\u00AD\u00A9\u00E6\u00AD\u0090\u00F2\u00BA\u0097\u00B0\u00EC\u00A3\u0088",
      utf8: "\uD834\uDF03\u520A\u0133\u0606\uDADC\uDD26\u004E\u9B8B\uB1C3\u01FC\u0290\u0063\u6A4D\uACF4\u002A\u0052\u92EC\uD150\u0396\u0717\uDBA5\uDC60\uD870\uDC66\u8EE8\u0066\u01B7\u06A8\u66F0\u0072\u010D\uD916\uDF69\u6B50\uDAA9\uDDF0\uC8C8",
      base32:
        "6COYZA7FRCFMJM6YQ3ZYPBFGJ3U25C7LQ6B4PPGKSBR6NKMN5KZ3IKSS5GF2Z3MFSDHJNXEX6O4ZDIHQVSA2N2F3VBTMNN62VDTJXMDSYSG7DFNNVHTK3EHSXKL3B3FDRA",
      hex: "F09D8C83E5888AC4B3D886F38784A64EE9AE8BEB8783C7BCCA9063E6A98DEAB3B42A52E98BACED8590CE96DC97F3B991A0F0AC81A6E8BBA866C6B7DAA8E69BB072C48DF195ADA9E6AD90F2BA97B0ECA388",
      hotp: {
        constructor: {
          input: {},
        },
        generate: {
          input: { counter: 1e10 },
          output: "290910",
        },
        validate: {
          input: { token: "290910", counter: 1e10 - 1, window: 0 },
          output: null,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=6COYZA7FRCFMJM6YQ3ZYPBFGJ3U25C7LQ6B4PPGKSBR6NKMN5KZ3IKSS5GF2Z3MFSDHJNXEX6O4ZDIHQVSA2N2F3VBTMNN62VDTJXMDSYSG7DFNNVHTK3EHSXKL3B3FDRA&algorithm=SHA1&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: {},
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "003038",
        },
        validate: {
          input: { token: "003038", timestamp: 1451603700000, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=6COYZA7FRCFMJM6YQ3ZYPBFGJ3U25C7LQ6B4PPGKSBR6NKMN5KZ3IKSS5GF2Z3MFSDHJNXEX6O4ZDIHQVSA2N2F3VBTMNN62VDTJXMDSYSG7DFNNVHTK3EHSXKL3B3FDRA&algorithm=SHA1&digits=6&period=30",
        },
      },
    },
    {
      // 08
      buffer: new Uint8Array([
        124, 235, 179, 166, 107, 242, 177, 187, 132, 231, 152, 139, 65, 234,
        131, 161, 243, 140, 169, 165, 45, 241, 153, 191, 153, 239, 191, 189,
        195, 149, 95, 227, 179, 153, 237, 140, 137, 227, 188, 137, 217, 135,
        239, 159, 156, 103, 215, 180, 35, 239, 191, 189, 225, 182, 175, 243,
        181, 130, 172, 241, 137, 173, 148, 227, 153, 191, 227, 181, 148, 212,
        139, 222, 186, 239, 191, 189, 241, 159, 133, 157, 242, 178, 165, 150,
      ]).buffer,
      latin1:
        "\u007C\u00EB\u00B3\u00A6\u006B\u00F2\u00B1\u00BB\u0084\u00E7\u0098\u008B\u0041\u00EA\u0083\u00A1\u00F3\u008C\u00A9\u00A5\u002D\u00F1\u0099\u00BF\u0099\u00EF\u00BF\u00BD\u00C3\u0095\u005F\u00E3\u00B3\u0099\u00ED\u008C\u0089\u00E3\u00BC\u0089\u00D9\u0087\u00EF\u009F\u009C\u0067\u00D7\u00B4\u0023\u00EF\u00BF\u00BD\u00E1\u00B6\u00AF\u00F3\u00B5\u0082\u00AC\u00F1\u0089\u00AD\u0094\u00E3\u0099\u00BF\u00E3\u00B5\u0094\u00D4\u008B\u00DE\u00BA\u00EF\u00BF\u00BD\u00F1\u009F\u0085\u009D\u00F2\u00B2\u00A5\u0096",
      utf8: "\u007C\uBCE6\u006B\uDA87\uDEC4\u760B\u0041\uA0E1\uDAF2\uDE65\u002D\uD927\uDFD9\uFFFD\u00D5\u005F\u3CD9\uD309\u3F09\u0647\uF7DC\u0067\u05F4\u0023\uFFFD\u1DAF\uDB94\uDCAC\uD8E6\uDF54\u367F\u3D54\u050B\u07BA\uFFFD\uD93C\uDD5D\uDA8A\uDD56",
      base32:
        "PTV3HJTL6KY3XBHHTCFUD2UDUHZYZKNFFXYZTP4Z56733Q4VL7R3HGPNRSE6HPEJ3GD67H44M7L3II7PX666DNVP6O2YFLHRRGWZJY4ZX7R3LFGURPPLV357XXYZ7BM56KZKLFQ",
      hex: "7CEBB3A66BF2B1BB84E7988B41EA83A1F38CA9A52DF199BF99EFBFBDC3955FE3B399ED8C89E3BC89D987EF9F9C67D7B423EFBFBDE1B6AFF3B582ACF189AD94E399BFE3B594D48BDEBAEFBFBDF19F859DF2B2A596",
      hotp: {
        constructor: {
          input: {},
        },
        generate: {
          input: { counter: 1e10 },
          output: "851410",
        },
        validate: {
          input: { token: "851410", counter: 1e10 },
          output: 0,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=PTV3HJTL6KY3XBHHTCFUD2UDUHZYZKNFFXYZTP4Z56733Q4VL7R3HGPNRSE6HPEJ3GD67H44M7L3II7PX666DNVP6O2YFLHRRGWZJY4ZX7R3LFGURPPLV357XXYZ7BM56KZKLFQ&algorithm=SHA1&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: {},
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "218265",
        },
        validate: {
          input: { token: "218265", timestamp: 1451603700000, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=PTV3HJTL6KY3XBHHTCFUD2UDUHZYZKNFFXYZTP4Z56733Q4VL7R3HGPNRSE6HPEJ3GD67H44M7L3II7PX666DNVP6O2YFLHRRGWZJY4ZX7R3LFGURPPLV357XXYZ7BM56KZKLFQ&algorithm=SHA1&digits=6&period=30",
        },
      },
    },
    {
      // 09
      buffer: new Uint8Array([
        125, 217, 191, 233, 141, 172, 225, 132, 132, 225, 174, 161, 221, 165,
        243, 164, 175, 160, 210, 153, 214, 162, 86, 46, 199, 160, 241, 147, 141,
        142, 194, 144, 91, 242, 146, 130, 168, 242, 154, 148, 182, 83, 240, 187,
        140, 187, 229, 146, 165, 214, 182, 35, 243, 172, 165, 188, 115, 240,
        149, 135, 128, 241, 130, 167, 167, 234, 163, 184, 50, 63, 75, 241, 183,
        177, 190, 71,
      ]).buffer,
      latin1:
        "\u007D\u00D9\u00BF\u00E9\u008D\u00AC\u00E1\u0084\u0084\u00E1\u00AE\u00A1\u00DD\u00A5\u00F3\u00A4\u00AF\u00A0\u00D2\u0099\u00D6\u00A2\u0056\u002E\u00C7\u00A0\u00F1\u0093\u008D\u008E\u00C2\u0090\u005B\u00F2\u0092\u0082\u00A8\u00F2\u009A\u0094\u00B6\u0053\u00F0\u00BB\u008C\u00BB\u00E5\u0092\u00A5\u00D6\u00B6\u0023\u00F3\u00AC\u00A5\u00BC\u0073\u00F0\u0095\u0087\u0080\u00F1\u0082\u00A7\u00A7\u00EA\u00A3\u00B8\u0032\u003F\u004B\u00F1\u00B7\u00B1\u00BE\u0047",
      utf8: "\u007D\u067F\u936C\u1104\u1BA1\u0765\uDB52\uDFE0\u0499\u05A2\u0056\u002E\u01E0\uD90C\uDF4E\u0090\u005B\uDA08\uDCA8\uDA29\uDD36\u0053\uD8AC\uDF3B\u54A5\u05B6\u0023\uDB72\uDD7C\u0073\uD814\uDDC0\uD8CA\uDDE7\uA8F8\u0032\u003F\u004B\uD99F\uDC7E\u0047",
      base32:
        "PXM372MNVTQYJBHBV2Q53JPTUSX2BUUZ22RFMLWHUDYZHDMOYKIFX4USQKUPFGUUWZJ7BO4MXPSZFJOWWYR7HLFFXRZ7BFMHQDYYFJ5H5KR3QMR7JPY3PMN6I4",
      hex: "7DD9BFE98DACE18484E1AEA1DDA5F3A4AFA0D299D6A2562EC7A0F1938D8EC2905BF29282A8F29A94B653F0BB8CBBE592A5D6B623F3ACA5BC73F0958780F182A7A7EAA3B8323F4BF1B7B1BE47",
      hotp: {
        constructor: {
          input: {},
        },
        generate: {
          input: { counter: 1e10 },
          output: "591041",
        },
        validate: {
          input: { token: "591041", counter: 1e10 + 2 },
          output: null,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=PXM372MNVTQYJBHBV2Q53JPTUSX2BUUZ22RFMLWHUDYZHDMOYKIFX4USQKUPFGUUWZJ7BO4MXPSZFJOWWYR7HLFFXRZ7BFMHQDYYFJ5H5KR3QMR7JPY3PMN6I4&algorithm=SHA1&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: {},
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "514422",
        },
        validate: {
          input: { token: "514422", timestamp: 1451606400000 },
          output: 0,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=PXM372MNVTQYJBHBV2Q53JPTUSX2BUUZ22RFMLWHUDYZHDMOYKIFX4USQKUPFGUUWZJ7BO4MXPSZFJOWWYR7HLFFXRZ7BFMHQDYYFJ5H5KR3QMR7JPY3PMN6I4&algorithm=SHA1&digits=6&period=30",
        },
      },
    },
    {
      // 10
      buffer: new Uint8Array([
        225, 164, 134, 199, 173, 67, 212, 142, 223, 187, 205, 130, 215, 144,
        203, 133, 194, 129, 35, 103, 197, 159, 229, 161, 173, 200, 154, 45, 195,
        156, 93, 123, 216, 138, 228, 165, 177, 120, 237, 146, 153, 240, 149,
        140, 175, 210, 179, 212, 145, 232, 162, 158, 208, 165, 108, 197, 177,
        49, 238, 172, 151, 207, 131,
      ]).buffer,
      latin1:
        "\u00E1\u00A4\u0086\u00C7\u00AD\u0043\u00D4\u008E\u00DF\u00BB\u00CD\u0082\u00D7\u0090\u00CB\u0085\u00C2\u0081\u0023\u0067\u00C5\u009F\u00E5\u00A1\u00AD\u00C8\u009A\u002D\u00C3\u009C\u005D\u007B\u00D8\u008A\u00E4\u00A5\u00B1\u0078\u00ED\u0092\u0099\u00F0\u0095\u008C\u00AF\u00D2\u00B3\u00D4\u0091\u00E8\u00A2\u009E\u00D0\u00A5\u006C\u00C5\u00B1\u0031\u00EE\u00AC\u0097\u00CF\u0083",
      utf8: "\u1906\u01ED\u0043\u050E\u07FB\u0342\u05D0\u02C5\u0081\u0023\u0067\u015F\u586D\u021A\u002D\u00DC\u005D\u007B\u060A\u4971\u0078\uD499\uD814\uDF2F\u04B3\u0511\u889E\u0425\u006C\u0171\u0031\uEB17\u03C3",
      base32:
        "4GSINR5NIPKI5X53ZWBNPEGLQXBICI3HYWP6LINNZCNC3Q44LV55RCXEUWYXR3MSTHYJLDFP2KZ5JEPIUKPNBJLMYWYTD3VMS7HYG",
      hex: "E1A486C7AD43D48EDFBBCD82D790CB85C2812367C59FE5A1ADC89A2DC39C5D7BD88AE4A5B178ED9299F0958CAFD2B3D491E8A29ED0A56CC5B131EEAC97CF83",
      hotp: {
        constructor: {
          input: { algorithm: "sha1" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "717279",
        },
        validate: {
          input: { token: "717279", counter: 1e10 - 90, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=4GSINR5NIPKI5X53ZWBNPEGLQXBICI3HYWP6LINNZCNC3Q44LV55RCXEUWYXR3MSTHYJLDFP2KZ5JEPIUKPNBJLMYWYTD3VMS7HYG&algorithm=SHA1&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { algorithm: "sha1", period: 5 },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "245126",
        },
        validate: {
          input: { token: "245126", timestamp: 1451606395000 },
          output: 1,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=4GSINR5NIPKI5X53ZWBNPEGLQXBICI3HYWP6LINNZCNC3Q44LV55RCXEUWYXR3MSTHYJLDFP2KZ5JEPIUKPNBJLMYWYTD3VMS7HYG&algorithm=SHA1&digits=6&period=5",
        },
      },
    },
    {
      // 11
      buffer: new Uint8Array([
        38, 212, 134, 241, 135, 191, 167, 125, 236, 129, 131, 222, 187, 241,
        145, 189, 142, 199, 137, 220, 152, 227, 168, 152, 241, 165, 173, 148,
        122, 232, 158, 129, 238, 166, 154, 228, 168, 153, 229, 176, 178, 77,
        239, 191, 189, 231, 147, 163, 235, 175, 179, 243, 160, 177, 149, 204,
        180, 201, 177, 218, 166, 240, 155, 183, 182, 37, 205, 153, 48, 232, 160,
        146, 43, 238, 187, 149, 230, 148, 172,
      ]).buffer,
      latin1:
        "\u0026\u00D4\u0086\u00F1\u0087\u00BF\u00A7\u007D\u00EC\u0081\u0083\u00DE\u00BB\u00F1\u0091\u00BD\u008E\u00C7\u0089\u00DC\u0098\u00E3\u00A8\u0098\u00F1\u00A5\u00AD\u0094\u007A\u00E8\u009E\u0081\u00EE\u00A6\u009A\u00E4\u00A8\u0099\u00E5\u00B0\u00B2\u004D\u00EF\u00BF\u00BD\u00E7\u0093\u00A3\u00EB\u00AF\u00B3\u00F3\u00A0\u00B1\u0095\u00CC\u00B4\u00C9\u00B1\u00DA\u00A6\u00F0\u009B\u00B7\u00B6\u0025\u00CD\u0099\u0030\u00E8\u00A0\u0092\u002B\u00EE\u00BB\u0095\u00E6\u0094\u00AC",
      utf8: "\u0026\u0506\uD8DF\uDFE7\u007D\uC043\u07BB\uD907\uDF4E\u01C9\u0718\u3A18\uD956\uDF54\u007A\u8781\uE99A\u4A19\u5C32\u004D\uFFFD\u74E3\uBBF3\uDB43\uDC55\u0334\u0271\u06A6\uD82F\uDDF6\u0025\u0359\u0030\u8812\u002B\uEED5\u652C",
      base32:
        "E3KIN4MHX6TX33EBQPPLX4MRXWHMPCO4TDR2RGHRUWWZI6XIT2A65JU24SUJTZNQWJG67P5546J2H25PWPZ2BMMVZS2MTMO2U3YJXN5WEXGZSMHIUCJCX3V3SXTJJLA",
      hex: "26D486F187BFA77DEC8183DEBBF191BD8EC789DC98E3A898F1A5AD947AE89E81EEA69AE4A899E5B0B24DEFBFBDE793A3EBAFB3F3A0B195CCB4C9B1DAA6F09BB7B625CD9930E8A0922BEEBB95E694AC",
      hotp: {
        constructor: {
          input: { algorithm: "sha224" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "796737",
        },
        validate: {
          input: { token: "796737", counter: 1e10 - 90, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=E3KIN4MHX6TX33EBQPPLX4MRXWHMPCO4TDR2RGHRUWWZI6XIT2A65JU24SUJTZNQWJG67P5546J2H25PWPZ2BMMVZS2MTMO2U3YJXN5WEXGZSMHIUCJCX3V3SXTJJLA&algorithm=SHA224&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { algorithm: "sha224", period: 5 },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "539931",
        },
        validate: {
          input: { token: "539931", timestamp: 1451606395000 },
          output: 1,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=E3KIN4MHX6TX33EBQPPLX4MRXWHMPCO4TDR2RGHRUWWZI6XIT2A65JU24SUJTZNQWJG67P5546J2H25PWPZ2BMMVZS2MTMO2U3YJXN5WEXGZSMHIUCJCX3V3SXTJJLA&algorithm=SHA224&digits=6&period=5",
        },
      },
    },
    {
      // 12
      buffer: new Uint8Array([
        195, 152, 243, 191, 187, 140, 223, 185, 242, 181, 165, 182, 240, 156,
        166, 146, 243, 178, 133, 177, 239, 181, 131, 101, 229, 128, 152, 243,
        140, 147, 158, 78, 230, 170, 169, 40, 67, 213, 159, 82, 229, 142, 162,
        205, 184, 227, 151, 174, 204, 186, 196, 155, 197, 134, 210, 177, 240,
        180, 181, 155, 210, 130, 232, 148, 175, 241, 138, 129, 162, 236, 180,
        167, 238, 140, 155, 54, 229, 148, 165, 56,
      ]).buffer,
      latin1:
        "\u00C3\u0098\u00F3\u00BF\u00BB\u008C\u00DF\u00B9\u00F2\u00B5\u00A5\u00B6\u00F0\u009C\u00A6\u0092\u00F3\u00B2\u0085\u00B1\u00EF\u00B5\u0083\u0065\u00E5\u0080\u0098\u00F3\u008C\u0093\u009E\u004E\u00E6\u00AA\u00A9\u0028\u0043\u00D5\u009F\u0052\u00E5\u008E\u00A2\u00CD\u00B8\u00E3\u0097\u00AE\u00CC\u00BA\u00C4\u009B\u00C5\u0086\u00D2\u00B1\u00F0\u00B4\u00B5\u009B\u00D2\u0082\u00E8\u0094\u00AF\u00F1\u008A\u0081\u00A2\u00EC\u00B4\u00A7\u00EE\u008C\u009B\u0036\u00E5\u0094\u00A5\u0038",
      utf8: "\u00D8\uDBBF\uDECC\u07F9\uDA96\uDD76\uD832\uDD92\uDB88\uDD71\uFD43\u0065\u5018\uDAF1\uDCDE\u004E\u6AA9\u0028\u0043\u055F\u0052\u53A2\u0378\u35EE\u033A\u011B\u0146\u04B1\uD893\uDD5B\u0482\u852F\uD8E8\uDC62\uCD27\uE31B\u0036\u5525\u0038",
      base32:
        "YOMPHP53RTP3T4VVUW3PBHFGSLZ3FBNR562YGZPFQCMPHDETTZHONKVJFBB5LH2S4WHKFTNY4OL25TF2YSN4LBWSWHYLJNM32KBORFFP6GFIDIXMWST65DE3G3SZJJJY",
      hex: "C398F3BFBB8CDFB9F2B5A5B6F09CA692F3B285B1EFB58365E58098F38C939E4EE6AAA92843D59F52E58EA2CDB8E397AECCBAC49BC586D2B1F0B4B59BD282E894AFF18A81A2ECB4A7EE8C9B36E594A538",
      hotp: {
        constructor: {
          input: { algorithm: "sha256" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "247580",
        },
        validate: {
          input: { token: "247580", counter: 1e10 - 90, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=YOMPHP53RTP3T4VVUW3PBHFGSLZ3FBNR562YGZPFQCMPHDETTZHONKVJFBB5LH2S4WHKFTNY4OL25TF2YSN4LBWSWHYLJNM32KBORFFP6GFIDIXMWST65DE3G3SZJJJY&algorithm=SHA256&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { algorithm: "sha256", period: 5 },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "723212",
        },
        validate: {
          input: { token: "723212", timestamp: 1451606395000 },
          output: 1,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=YOMPHP53RTP3T4VVUW3PBHFGSLZ3FBNR562YGZPFQCMPHDETTZHONKVJFBB5LH2S4WHKFTNY4OL25TF2YSN4LBWSWHYLJNM32KBORFFP6GFIDIXMWST65DE3G3SZJJJY&algorithm=SHA256&digits=6&period=5",
        },
      },
    },
    {
      // 13
      buffer: new Uint8Array([
        241, 139, 170, 166, 227, 185, 176, 232, 184, 172, 231, 165, 137, 198,
        167, 217, 179, 234, 130, 136, 80, 214, 137, 240, 155, 176, 136, 239,
        159, 177, 195, 158, 202, 188, 76, 239, 148, 159, 228, 158, 149, 229,
        155, 136, 225, 189, 178, 223, 133, 215, 180, 236, 140, 180, 242, 191,
        144, 132, 240, 153, 167, 167, 238, 162, 154, 107, 224, 186, 184, 243,
        148, 128, 149, 239, 129, 143, 209, 157, 229, 129, 172, 243, 144, 145,
        168, 241, 168, 188, 164,
      ]).buffer,
      latin1:
        "\u00F1\u008B\u00AA\u00A6\u00E3\u00B9\u00B0\u00E8\u00B8\u00AC\u00E7\u00A5\u0089\u00C6\u00A7\u00D9\u00B3\u00EA\u0082\u0088\u0050\u00D6\u0089\u00F0\u009B\u00B0\u0088\u00EF\u009F\u00B1\u00C3\u009E\u00CA\u00BC\u004C\u00EF\u0094\u009F\u00E4\u009E\u0095\u00E5\u009B\u0088\u00E1\u00BD\u00B2\u00DF\u0085\u00D7\u00B4\u00EC\u008C\u00B4\u00F2\u00BF\u0090\u0084\u00F0\u0099\u00A7\u00A7\u00EE\u00A2\u009A\u006B\u00E0\u00BA\u00B8\u00F3\u0094\u0080\u0095\u00EF\u0081\u008F\u00D1\u009D\u00E5\u0081\u00AC\u00F3\u0090\u0091\u00A8\u00F1\u00A8\u00BC\u00A4",
      utf8: "\uD8EE\uDEA6\u3E70\u8E2C\u7949\u01A7\u0673\uA088\u0050\u0589\uD82F\uDC08\uF7F1\u00DE\u02BC\u004C\uF51F\u4795\u56C8\u1F72\u07C5\u05F4\uC334\uDABD\uDC04\uD826\uDDE7\uE89A\u006B\u0EB8\uDB10\uDC15\uF04F\u045D\u506C\uDB01\uDC68\uD963\uDF24",
      base32:
        "6GF2VJXDXGYOROFM46SYTRVH3GZ6VAUIKDLIT4E3WCEO7H5RYOPMVPCM56KJ7ZE6SXSZXCHBXWZN7BOXWTWIZNHSX6IIJ4EZU6T65IU2NPQLVOHTSSAJL34BR7IZ3ZMBVTZZBENI6GULZJA",
      hex: "F18BAAA6E3B9B0E8B8ACE7A589C6A7D9B3EA828850D689F09BB088EF9FB1C39ECABC4CEF949FE49E95E59B88E1BDB2DF85D7B4EC8CB4F2BF9084F099A7A7EEA29A6BE0BAB8F3948095EF818FD19DE581ACF39091A8F1A8BCA4",
      hotp: {
        constructor: {
          input: { algorithm: "sha384" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "708330",
        },
        validate: {
          input: { token: "708330", counter: 1e10 - 90, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=6GF2VJXDXGYOROFM46SYTRVH3GZ6VAUIKDLIT4E3WCEO7H5RYOPMVPCM56KJ7ZE6SXSZXCHBXWZN7BOXWTWIZNHSX6IIJ4EZU6T65IU2NPQLVOHTSSAJL34BR7IZ3ZMBVTZZBENI6GULZJA&algorithm=SHA384&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { algorithm: "sha384", period: 5 },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "148929",
        },
        validate: {
          input: { token: "148929", timestamp: 1451606395000 },
          output: 1,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=6GF2VJXDXGYOROFM46SYTRVH3GZ6VAUIKDLIT4E3WCEO7H5RYOPMVPCM56KJ7ZE6SXSZXCHBXWZN7BOXWTWIZNHSX6IIJ4EZU6T65IU2NPQLVOHTSSAJL34BR7IZ3ZMBVTZZBENI6GULZJA&algorithm=SHA384&digits=6&period=5",
        },
      },
    },
    {
      // 14
      buffer: new Uint8Array([
        195, 174, 240, 184, 145, 188, 241, 161, 131, 168, 238, 171, 141, 219,
        143, 244, 138, 138, 153, 206, 160, 219, 177, 197, 152, 200, 149, 70,
        228, 181, 164, 240, 151, 170, 135, 232, 139, 147, 218, 156, 200, 148,
        34, 229, 128, 158, 242, 183, 188, 159, 205, 191, 217, 160, 220, 153,
        241, 156, 187, 182, 111, 240, 145, 171, 156, 242, 155, 128, 164, 202,
        133, 118, 72, 49, 76, 197, 139,
      ]).buffer,
      latin1:
        "\u00C3\u00AE\u00F0\u00B8\u0091\u00BC\u00F1\u00A1\u0083\u00A8\u00EE\u00AB\u008D\u00DB\u008F\u00F4\u008A\u008A\u0099\u00CE\u00A0\u00DB\u00B1\u00C5\u0098\u00C8\u0095\u0046\u00E4\u00B5\u00A4\u00F0\u0097\u00AA\u0087\u00E8\u008B\u0093\u00DA\u009C\u00C8\u0094\u0022\u00E5\u0080\u009E\u00F2\u00B7\u00BC\u009F\u00CD\u00BF\u00D9\u00A0\u00DC\u0099\u00F1\u009C\u00BB\u00B6\u006F\u00F0\u0091\u00AB\u009C\u00F2\u009B\u0080\u00A4\u00CA\u0085\u0076\u0048\u0031\u004C\u00C5\u008B",
      utf8: "\u00EE\uD8A1\uDC7C\uD944\uDCE8\uEACD\u06CF\uDBE8\uDE99\u03A0\u06F1\u0158\u0215\u0046\u4D64\uD81E\uDE87\u82D3\u069C\u0214\u0022\u501E\uDA9F\uDF1F\u037F\u0660\u0719\uD933\uDEF6\u006F\uD806\uDEDC\uDA2C\uDC24\u0285\u0076\u0048\u0031\u004C\u014B",
      base32:
        "YOXPBOERXTY2DA5I52VY3W4P6SFIVGOOUDN3DRMYZCKUNZFVUTYJPKUH5CFZHWU4ZCKCFZMAT3ZLPPE7ZW75TIG4THYZZO5WN7YJDK446KNYBJGKQV3EQMKMYWFQ",
      hex: "C3AEF0B891BCF1A183A8EEAB8DDB8FF48A8A99CEA0DBB1C598C89546E4B5A4F097AA87E88B93DA9CC89422E5809EF2B7BC9FCDBFD9A0DC99F19CBBB66FF091AB9CF29B80A4CA857648314CC58B",
      hotp: {
        constructor: {
          input: { algorithm: "sha512" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "319863",
        },
        validate: {
          input: { token: "319863", counter: 1e10 - 90, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=YOXPBOERXTY2DA5I52VY3W4P6SFIVGOOUDN3DRMYZCKUNZFVUTYJPKUH5CFZHWU4ZCKCFZMAT3ZLPPE7ZW75TIG4THYZZO5WN7YJDK446KNYBJGKQV3EQMKMYWFQ&algorithm=SHA512&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { algorithm: "sha512", period: 5 },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "912745",
        },
        validate: {
          input: { token: "912745", timestamp: 1451606395000 },
          output: 1,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=YOXPBOERXTY2DA5I52VY3W4P6SFIVGOOUDN3DRMYZCKUNZFVUTYJPKUH5CFZHWU4ZCKCFZMAT3ZLPPE7ZW75TIG4THYZZO5WN7YJDK446KNYBJGKQV3EQMKMYWFQ&algorithm=SHA512&digits=6&period=5",
        },
      },
    },
    {
      // 15
      buffer: new Uint8Array([
        210, 168, 57, 224, 162, 150, 203, 188, 205, 191, 216, 137, 242, 133,
        164, 144, 236, 128, 150, 235, 137, 135, 226, 174, 155, 235, 188, 155,
        232, 132, 146, 199, 174, 201, 154, 244, 134, 173, 167, 229, 158, 152,
        32, 243, 181, 186, 138, 242, 180, 144, 149, 206, 165, 76, 228, 187, 173,
        84, 240, 162, 146, 165, 225, 158, 160, 217, 149, 212, 191, 60, 99, 118,
        79, 224, 168, 155,
      ]).buffer,
      latin1:
        "\u00D2\u00A8\u0039\u00E0\u00A2\u0096\u00CB\u00BC\u00CD\u00BF\u00D8\u0089\u00F2\u0085\u00A4\u0090\u00EC\u0080\u0096\u00EB\u0089\u0087\u00E2\u00AE\u009B\u00EB\u00BC\u009B\u00E8\u0084\u0092\u00C7\u00AE\u00C9\u009A\u00F4\u0086\u00AD\u00A7\u00E5\u009E\u0098\u0020\u00F3\u00B5\u00BA\u008A\u00F2\u00B4\u0090\u0095\u00CE\u00A5\u004C\u00E4\u00BB\u00AD\u0054\u00F0\u00A2\u0092\u00A5\u00E1\u009E\u00A0\u00D9\u0095\u00D4\u00BF\u003C\u0063\u0076\u004F\u00E0\u00A8\u009B",
      utf8: "\u04A8\u0039\u0896\u02FC\u037F\u0609\uD9D6\uDD10\uC016\uB247\u2B9B\uBF1B\u8112\u01EE\u025A\uDBDA\uDF67\u5798\u0020\uDB97\uDE8A\uDA91\uDC15\u03A5\u004C\u4EED\u0054\uD849\uDCA5\u17A0\u0655\u053F\u003C\u0063\u0076\u004F\u0A1B",
      base32:
        "2KUDTYFCS3F3ZTN73CE7FBNESDWIBFXLRGD6FLU35O6JX2EESLD25SM26SDK3J7FT2MCB45VXKFPFNEQSXHKKTHEXOWVJ4FCSKS6DHVA3GK5JPZ4MN3E7YFITM",
      hex: "D2A839E0A296CBBCCDBFD889F285A490EC8096EB8987E2AE9BEBBC9BE88492C7AEC99AF486ADA7E59E9820F3B5BA8AF2B49095CEA54CE4BBAD54F0A292A5E19EA0D995D4BF3C63764FE0A89B",
      hotp: {
        constructor: {
          input: { algorithm: "sha3-224" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "628940",
        },
        validate: {
          input: { token: "628940", counter: 1e10 - 90, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=2KUDTYFCS3F3ZTN73CE7FBNESDWIBFXLRGD6FLU35O6JX2EESLD25SM26SDK3J7FT2MCB45VXKFPFNEQSXHKKTHEXOWVJ4FCSKS6DHVA3GK5JPZ4MN3E7YFITM&algorithm=SHA3-224&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { algorithm: "sha3-224", period: 5 },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "048033",
        },
        validate: {
          input: { token: "048033", timestamp: 1451606395000 },
          output: 1,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=2KUDTYFCS3F3ZTN73CE7FBNESDWIBFXLRGD6FLU35O6JX2EESLD25SM26SDK3J7FT2MCB45VXKFPFNEQSXHKKTHEXOWVJ4FCSKS6DHVA3GK5JPZ4MN3E7YFITM&algorithm=SHA3-224&digits=6&period=5",
        },
      },
    },
    {
      // 16
      buffer: new Uint8Array([
        243, 156, 137, 143, 241, 141, 158, 172, 89, 239, 146, 150, 231, 148,
        148, 58, 217, 173, 48, 243, 179, 171, 183, 202, 131, 95, 199, 189, 58,
        234, 128, 129, 112, 235, 146, 163, 104, 80, 213, 180, 244, 142, 134,
        145, 72, 97, 241, 189, 148, 135, 229, 170, 142, 240, 164, 179, 130, 109,
        200, 176, 213, 168, 212, 172, 240, 144, 164, 187, 243, 129, 187, 170,
        229, 131, 146,
      ]).buffer,
      latin1:
        "\u00F3\u009C\u0089\u008F\u00F1\u008D\u009E\u00AC\u0059\u00EF\u0092\u0096\u00E7\u0094\u0094\u003A\u00D9\u00AD\u0030\u00F3\u00B3\u00AB\u00B7\u00CA\u0083\u005F\u00C7\u00BD\u003A\u00EA\u0080\u0081\u0070\u00EB\u0092\u00A3\u0068\u0050\u00D5\u00B4\u00F4\u008E\u0086\u0091\u0048\u0061\u00F1\u00BD\u0094\u0087\u00E5\u00AA\u008E\u00F0\u00A4\u00B3\u0082\u006D\u00C8\u00B0\u00D5\u00A8\u00D4\u00AC\u00F0\u0090\u00A4\u00BB\u00F3\u0081\u00BB\u00AA\u00E5\u0083\u0092",
      utf8: "\uDB30\uDE4F\uD8F5\uDFAC\u0059\uF496\u7514\u003A\u066D\u0030\uDB8E\uDEF7\u0283\u005F\u01FD\u003A\uA001\u0070\uB4A3\u0068\u0050\u0574\uDBF8\uDD91\u0048\u0061\uD9B5\uDD07\u5A8E\uD853\uDCC2\u006D\u0230\u0568\u052C\uD802\uDD3B\uDAC7\uDEEA\u50D2",
      base32:
        "6OOITD7RRWPKYWPPSKLOPFEUHLM22MHTWOV3PSUDL7D32OXKQCAXB24SUNUFBVNU6SHINEKIMHY33FEH4WVI54FEWOBG3SFQ2WUNJLHQSCSLX44BXOVOLA4S",
      hex: "F39C898FF18D9EAC59EF9296E794943AD9AD30F3B3ABB7CA835FC7BD3AEA808170EB92A36850D5B4F48E86914861F1BD9487E5AA8EF0A4B3826DC8B0D5A8D4ACF090A4BBF381BBAAE58392",
      hotp: {
        constructor: {
          input: { algorithm: "sha3-256" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "866227",
        },
        validate: {
          input: { token: "866227", counter: 1e10 - 90, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=6OOITD7RRWPKYWPPSKLOPFEUHLM22MHTWOV3PSUDL7D32OXKQCAXB24SUNUFBVNU6SHINEKIMHY33FEH4WVI54FEWOBG3SFQ2WUNJLHQSCSLX44BXOVOLA4S&algorithm=SHA3-256&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { algorithm: "sha3-256", period: 5 },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "317566",
        },
        validate: {
          input: { token: "317566", timestamp: 1451606395000 },
          output: 1,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=6OOITD7RRWPKYWPPSKLOPFEUHLM22MHTWOV3PSUDL7D32OXKQCAXB24SUNUFBVNU6SHINEKIMHY33FEH4WVI54FEWOBG3SFQ2WUNJLHQSCSLX44BXOVOLA4S&algorithm=SHA3-256&digits=6&period=5",
        },
      },
    },
    {
      // 17
      buffer: new Uint8Array([
        226, 155, 186, 235, 160, 147, 230, 160, 139, 94, 231, 187, 165, 231,
        171, 159, 244, 141, 136, 173, 214, 129, 241, 138, 137, 189, 75, 239,
        159, 145, 229, 186, 176, 225, 160, 164, 83, 237, 129, 179, 243, 189,
        177, 181, 239, 129, 153, 219, 135, 240, 146, 156, 137, 240, 159, 164,
        181, 87, 47, 237, 147, 171, 95, 243, 157, 164, 163, 236, 136, 128, 202,
        150, 194, 167, 220, 172, 237, 139, 171, 209, 143, 242, 155, 134, 186,
      ]).buffer,
      latin1:
        "\u00E2\u009B\u00BA\u00EB\u00A0\u0093\u00E6\u00A0\u008B\u005E\u00E7\u00BB\u00A5\u00E7\u00AB\u009F\u00F4\u008D\u0088\u00AD\u00D6\u0081\u00F1\u008A\u0089\u00BD\u004B\u00EF\u009F\u0091\u00E5\u00BA\u00B0\u00E1\u00A0\u00A4\u0053\u00ED\u0081\u00B3\u00F3\u00BD\u00B1\u00B5\u00EF\u0081\u0099\u00DB\u0087\u00F0\u0092\u009C\u0089\u00F0\u009F\u00A4\u00B5\u0057\u002F\u00ED\u0093\u00AB\u005F\u00F3\u009D\u00A4\u00A3\u00EC\u0088\u0080\u00CA\u0096\u00C2\u00A7\u00DC\u00AC\u00ED\u008B\u00AB\u00D1\u008F\u00F2\u009B\u0086\u00BA",
      utf8: "\u26FA\uB813\u680B\u005E\u7EE5\u7ADF\uDBF4\uDE2D\u0581\uD8E8\uDE7D\u004B\uF7D1\u5EB0\u1824\u0053\uD073\uDBB7\uDC75\uF059\u06C7\uD809\uDF09\uD83E\uDD35\u0057\u002F\uD4EB\u005F\uDB36\uDD23\uC200\u0296\u00A7\u072C\uD2EB\u044F\uDA2C\uDDBA",
      base32:
        "4KN3V25ASPTKBC264652LZ5LT72I3CFN22A7DCUJXVF67H4R4W5LBYNAURJ63ANT6O63DNPPQGM5XB7QSKOIT4E7US2VOL7NSOVV7445USR6ZCEAZKLMFJ64VTWYXK6RR7ZJXBV2",
      hex: "E29BBAEBA093E6A08B5EE7BBA5E7AB9FF48D88ADD681F18A89BD4BEF9F91E5BAB0E1A0A453ED81B3F3BDB1B5EF8199DB87F0929C89F09FA4B5572FED93AB5FF39DA4A3EC8880CA96C2A7DCACED8BABD18FF29B86BA",
      hotp: {
        constructor: {
          input: { algorithm: "sha3-384" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "502187",
        },
        validate: {
          input: { token: "502187", counter: 1e10 - 90, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=4KN3V25ASPTKBC264652LZ5LT72I3CFN22A7DCUJXVF67H4R4W5LBYNAURJ63ANT6O63DNPPQGM5XB7QSKOIT4E7US2VOL7NSOVV7445USR6ZCEAZKLMFJ64VTWYXK6RR7ZJXBV2&algorithm=SHA3-384&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { algorithm: "sha3-384", period: 5 },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "056545",
        },
        validate: {
          input: { token: "056545", timestamp: 1451606395000 },
          output: 1,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=4KN3V25ASPTKBC264652LZ5LT72I3CFN22A7DCUJXVF67H4R4W5LBYNAURJ63ANT6O63DNPPQGM5XB7QSKOIT4E7US2VOL7NSOVV7445USR6ZCEAZKLMFJ64VTWYXK6RR7ZJXBV2&algorithm=SHA3-384&digits=6&period=5",
        },
      },
    },
    {
      // 18
      buffer: new Uint8Array([
        243, 147, 158, 159, 244, 131, 177, 148, 242, 191, 136, 158, 243, 154,
        178, 190, 239, 170, 139, 213, 186, 218, 167, 238, 174, 158, 70, 199,
        140, 240, 167, 191, 187, 55, 123, 232, 175, 183, 244, 129, 151, 178, 57,
        51, 227, 139, 135, 230, 164, 179, 123, 91, 226, 131, 159, 209, 144, 241,
        147, 149, 190, 230, 138, 185, 223, 178, 238, 176, 179, 230, 157, 186,
        223, 163, 236, 180, 144, 198, 178, 241, 155, 175, 154,
      ]).buffer,
      latin1:
        "\u00F3\u0093\u009E\u009F\u00F4\u0083\u00B1\u0094\u00F2\u00BF\u0088\u009E\u00F3\u009A\u00B2\u00BE\u00EF\u00AA\u008B\u00D5\u00BA\u00DA\u00A7\u00EE\u00AE\u009E\u0046\u00C7\u008C\u00F0\u00A7\u00BF\u00BB\u0037\u007B\u00E8\u00AF\u00B7\u00F4\u0081\u0097\u00B2\u0039\u0033\u00E3\u008B\u0087\u00E6\u00A4\u00B3\u007B\u005B\u00E2\u0083\u009F\u00D1\u0090\u00F1\u0093\u0095\u00BE\u00E6\u008A\u00B9\u00DF\u00B2\u00EE\u00B0\u00B3\u00E6\u009D\u00BA\u00DF\u00A3\u00EC\u00B4\u0090\u00C6\u00B2\u00F1\u009B\u00AF\u009A",
      utf8: "\uDB0D\uDF9F\uDBCF\uDC54\uDABC\uDE1E\uDB2B\uDCBE\uFA8B\u057A\u06A7\uEB9E\u0046\u01CC\uD85F\uDFFB\u0037\u007B\u8BF7\uDBC5\uDDF2\u0039\u0033\u32C7\u6933\u007B\u005B\u20DF\u0450\uD90D\uDD7E\u62B9\u07F2\uEC33\u677A\u07E3\uCD10\u01B2\uD92E\uDFDA",
      base32:
        "6OJZ5H7UQOYZJ4V7RCPPHGVSX3X2VC6VXLNKP3VOTZDMPDHQU673WN335CX3P5EBS6ZDSM7DROD6NJFTPNN6FA472GIPDE4VX3TIVOO7WLXLBM7GTW5N7I7MWSIMNMXRTOXZU",
      hex: "F3939E9FF483B194F2BF889EF39AB2BEEFAA8BD5BADAA7EEAE9E46C78CF0A7BFBB377BE8AFB7F48197B23933E38B87E6A4B37B5BE2839FD190F19395BEE68AB9DFB2EEB0B3E69DBADFA3ECB490C6B2F19BAF9A",
      hotp: {
        constructor: {
          input: { algorithm: "sha3-512" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "239674",
        },
        validate: {
          input: { token: "239674", counter: 1e10 - 90, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=6OJZ5H7UQOYZJ4V7RCPPHGVSX3X2VC6VXLNKP3VOTZDMPDHQU673WN335CX3P5EBS6ZDSM7DROD6NJFTPNN6FA472GIPDE4VX3TIVOO7WLXLBM7GTW5N7I7MWSIMNMXRTOXZU&algorithm=SHA3-512&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { algorithm: "sha3-512", period: 5 },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "690174",
        },
        validate: {
          input: { token: "690174", timestamp: 1451606395000 },
          output: 1,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=6OJZ5H7UQOYZJ4V7RCPPHGVSX3X2VC6VXLNKP3VOTZDMPDHQU673WN335CX3P5EBS6ZDSM7DROD6NJFTPNN6FA472GIPDE4VX3TIVOO7WLXLBM7GTW5N7I7MWSIMNMXRTOXZU&algorithm=SHA3-512&digits=6&period=5",
        },
      },
    },
    {
      // 19
      buffer: new Uint8Array([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 194, 128, 194, 129,
        194, 130, 194, 131, 194, 132, 194, 133, 194, 134, 194, 135, 194, 136,
        194, 137, 194, 138, 194, 139, 194, 140, 194, 141, 194, 142, 194, 143,
        194, 144, 194, 145, 194, 146, 194, 147, 194, 148, 194, 149, 194, 150,
        194, 151, 194, 152, 194, 153, 194, 154, 194, 155, 194, 156, 194, 157,
        194, 158, 194, 159, 194, 160,
      ]).buffer,
      latin1:
        "\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009\u000A\u000B\u000C\u000D\u000E\u000F\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F\u0020\u00C2\u0080\u00C2\u0081\u00C2\u0082\u00C2\u0083\u00C2\u0084\u00C2\u0085\u00C2\u0086\u00C2\u0087\u00C2\u0088\u00C2\u0089\u00C2\u008A\u00C2\u008B\u00C2\u008C\u00C2\u008D\u00C2\u008E\u00C2\u008F\u00C2\u0090\u00C2\u0091\u00C2\u0092\u00C2\u0093\u00C2\u0094\u00C2\u0095\u00C2\u0096\u00C2\u0097\u00C2\u0098\u00C2\u0099\u00C2\u009A\u00C2\u009B\u00C2\u009C\u00C2\u009D\u00C2\u009E\u00C2\u009F\u00C2\u00A0",
      utf8: "\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009\u000A\u000B\u000C\u000D\u000E\u000F\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F\u0020\u0080\u0081\u0082\u0083\u0084\u0085\u0086\u0087\u0088\u0089\u008A\u008B\u008C\u008D\u008E\u008F\u0090\u0091\u0092\u0093\u0094\u0095\u0096\u0097\u0098\u0099\u009A\u009B\u009C\u009D\u009E\u009F\u00A0",
      base32:
        "AAAQEAYEAUDAOCAJBIFQYDIOB4IBCEQTCQKRMFYYDENBWHA5DYPSBQUAYKA4FAWCQPBIJQUFYKDMFB6CRDBITQUKYKF4FDGCRXBI5QUPYKIMFEOCSLBJHQUUYKK4FFWCS7BJRQUZYKNMFG6CTTBJ3QU6YKP4FIA",
      hex: "000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F20C280C281C282C283C284C285C286C287C288C289C28AC28BC28CC28DC28EC28FC290C291C292C293C294C295C296C297C298C299C29AC29BC29CC29DC29EC29FC2A0",
      hotp: {
        constructor: {
          input: { algorithm: "sha3-512" },
        },
        generate: {
          input: { counter: 1e10 },
          output: "385745",
        },
        validate: {
          input: { token: "385745", counter: 1e10 - 90, window: 100 },
          output: 90,
        },
        toString: {
          output:
            "otpauth://hotp/OTPAuth?secret=AAAQEAYEAUDAOCAJBIFQYDIOB4IBCEQTCQKRMFYYDENBWHA5DYPSBQUAYKA4FAWCQPBIJQUFYKDMFB6CRDBITQUKYKF4FDGCRXBI5QUPYKIMFEOCSLBJHQUUYKK4FFWCS7BJRQUZYKNMFG6CTTBJ3QU6YKP4FIA&algorithm=SHA3-512&digits=6&counter=0",
        },
      },
      totp: {
        constructor: {
          input: { algorithm: "sha3-512", period: 5 },
        },
        generate: {
          input: { timestamp: 1451606400000 },
          output: "213674",
        },
        validate: {
          input: { token: "213674", timestamp: 1451606395000 },
          output: 1,
        },
        toString: {
          output:
            "otpauth://totp/OTPAuth?secret=AAAQEAYEAUDAOCAJBIFQYDIOB4IBCEQTCQKRMFYYDENBWHA5DYPSBQUAYKA4FAWCQPBIJQUFYKDMFB6CRDBITQUKYKF4FDGCRXBI5QUPYKIMFEOCSLBJHQUUYKK4FFWCS7BJRQUZYKNMFG6CTTBJ3QU6YKP4FIA&algorithm=SHA3-512&digits=6&period=5",
        },
      },
    },
  ];
  /* eslint-enable */

  /* ================================================
   * Secret
   * ================================================
   */

  describe("Secret", () => {
    cases.forEach((input, index) => {
      it(`constructor[${index}]`, () => {
        const output = new OTPAuth.Secret({ buffer: input.buffer });

        assertEquals(
          new Uint8Array(output.buffer),
          new Uint8Array(input.buffer)
        );
        assertEquals(output.latin1, input.latin1);
        assertEquals(output.utf8, input.utf8);
        assertEquals(output.base32, input.base32);
        assertEquals(output.hex, input.hex);
      });
    });

    it(`constructor[${cases.length}]`, () => {
      const output = new OTPAuth.Secret({ size: 4096 });

      assert(output.buffer instanceof ArrayBuffer);
      assertEquals(output.buffer.byteLength, 4096);
      assert(typeof output.latin1 === "string");
      // eslint-disable-next-line no-control-regex
      assertMatch(output.latin1, /^[\u0000-\u00FF]{4096}$/);
      assert(typeof output.utf8 === "string");
      assert(typeof output.base32 === "string");
      assertMatch(output.base32, /^[2-7A-Z]{6554}$/);
      assert(typeof output.hex === "string");
      assertMatch(output.hex, /^[0-9A-F]{8192}$/);
    });

    it(`constructor[${cases.length + 1}]`, () => {
      const output = new OTPAuth.Secret();

      assert(output.buffer instanceof ArrayBuffer);
      assertEquals(output.buffer.byteLength, 20);
      assert(typeof output.latin1 === "string");
      // eslint-disable-next-line no-control-regex
      assertMatch(output.latin1, /^[\u0000-\u00FF]{20}$/);
      assert(typeof output.utf8 === "string");
      assert(typeof output.base32 === "string");
      assertMatch(output.base32, /^[2-7A-Z]{32}$/);
      assert(typeof output.hex === "string");
      assertMatch(output.hex, /^[0-9A-F]{40}$/);
    });

    cases.forEach((input, index) => {
      it(`fromLatin1[${index}]`, () => {
        const output = OTPAuth.Secret.fromLatin1(input.latin1);

        assert(output instanceof OTPAuth.Secret);
        assertEquals(
          new Uint8Array(output.buffer),
          new Uint8Array(input.buffer)
        );
        assertEquals(output.latin1, input.latin1);
        assertEquals(output.utf8, input.utf8);
        assertEquals(output.base32, input.base32);
        assertEquals(output.hex, input.hex);
      });
    });

    cases.forEach((input, index) => {
      it(`fromUTF8[${index}]`, () => {
        const output = OTPAuth.Secret.fromUTF8(input.utf8);

        assert(output instanceof OTPAuth.Secret);
        assertEquals(
          new Uint8Array(output.buffer),
          new Uint8Array(input.buffer)
        );
        assertEquals(output.latin1, input.latin1);
        assertEquals(output.utf8, input.utf8);
        assertEquals(output.base32, input.base32);
        assertEquals(output.hex, input.hex);
      });
    });

    cases.forEach((input, index) => {
      it(`fromBase32[${index}]`, () => {
        const output = OTPAuth.Secret.fromBase32(input.base32);

        assert(output instanceof OTPAuth.Secret);
        assertEquals(
          new Uint8Array(output.buffer),
          new Uint8Array(input.buffer)
        );
        assertEquals(output.latin1, input.latin1);
        assertEquals(output.utf8, input.utf8);
        assertEquals(output.base32, input.base32);
        assertEquals(output.hex, input.hex);
      });
    });

    cases.forEach((input, index) => {
      it(`fromHex[${index}]`, () => {
        const output = OTPAuth.Secret.fromHex(input.hex);

        assert(output instanceof OTPAuth.Secret);
        assertEquals(
          new Uint8Array(output.buffer),
          new Uint8Array(input.buffer)
        );
        assertEquals(output.latin1, input.latin1);
        assertEquals(output.utf8, input.utf8);
        assertEquals(output.base32, input.base32);
        assertEquals(output.hex, input.hex);
      });
    });
  });

  /* ================================================
   * HOTP
   * ================================================
   */

  describe("HOTP", () => {
    it("defaults", () => {
      const hotp = new OTPAuth.HOTP();

      assertEquals(hotp.issuer, "");
      assertEquals(hotp.label, "OTPAuth");
      assert(hotp.secret instanceof OTPAuth.Secret);
      assertEquals(hotp.algorithm, "SHA1");
      assertEquals(hotp.digits, 6);
      assertEquals(hotp.counter, 0);

      assert(typeof hotp.generate() === "string");
      assert(hotp.generate().length === 6);

      assertEquals(hotp.validate({ token: hotp.generate() }), -1);

      // Counter is incremented on each 'generate' call.
      assertEquals(hotp.counter, 3);
    });

    cases.forEach((input, index) => {
      it(`generate[${index}]`, () => {
        const hotp = new OTPAuth.HOTP({
          ...input.hotp.constructor.input,
          secret: input.base32,
        });

        const output = hotp.generate(input.hotp.generate.input);
        assertEquals(output, input.hotp.generate.output);
      });
    });

    cases.forEach((input, index) => {
      it(`validate[${index}]`, () => {
        const hotp = new OTPAuth.HOTP({
          ...input.hotp.constructor.input,
          secret: new OTPAuth.Secret({ buffer: input.buffer }),
        });

        const output = hotp.validate(input.hotp.validate.input);
        assertEquals(output, input.hotp.validate.output);
      });
    });

    cases.forEach((input, index) => {
      it(`toString[${index}]`, () => {
        const hotp = new OTPAuth.HOTP({
          ...input.hotp.constructor.input,
          secret: new OTPAuth.Secret({ buffer: input.buffer }),
        });

        const output = hotp.toString();
        assertEquals(output, input.hotp.toString.output);
      });
    });
  });

  /* ================================================
   * TOTP
   * ================================================
   */

  describe("TOTP", () => {
    it("defaults", () => {
      const totp = new OTPAuth.TOTP();

      assertEquals(totp.issuer, "");
      assertEquals(totp.label, "OTPAuth");
      assert(totp.secret instanceof OTPAuth.Secret);
      assertEquals(totp.algorithm, "SHA1");
      assertEquals(totp.digits, 6);
      assertEquals(totp.period, 30);

      assert(typeof totp.generate() === "string");
      assert(totp.generate().length === 6);

      assertEquals(totp.validate({ token: totp.generate() }), 0);
    });

    cases.forEach((input, index) => {
      it(`generate[${index}]`, () => {
        const totp = new OTPAuth.TOTP({
          ...input.totp.constructor.input,
          secret: input.base32,
        });

        const output = totp.generate(input.totp.generate.input);
        assertEquals(output, input.totp.generate.output);
      });
    });

    cases.forEach((input, index) => {
      it(`validate[${index}]`, () => {
        const totp = new OTPAuth.TOTP({
          ...input.totp.constructor.input,
          secret: new OTPAuth.Secret({ buffer: input.buffer }),
        });

        const output = totp.validate(input.totp.validate.input);
        assertEquals(output, input.totp.validate.output);
      });
    });

    cases.forEach((input, index) => {
      it(`toString[${index}]`, () => {
        const totp = new OTPAuth.TOTP({
          ...input.totp.constructor.input,
          secret: new OTPAuth.Secret({ buffer: input.buffer }),
        });

        const output = totp.toString();
        assertEquals(output, input.totp.toString.output);
      });
    });
  });

  /* ================================================
   * URI
   * ================================================
   */

  describe("URI", () => {
    cases.forEach((input, index) => {
      it(`parse[${index}] - HOTP`, () => {
        const hotp = new OTPAuth.HOTP({
          ...input.hotp.constructor.input,
          secret: new OTPAuth.Secret({ buffer: input.buffer }),
        });

        const output = OTPAuth.URI.parse(input.hotp.toString.output);
        assertEquals(output, hotp);
      });
    });

    cases.forEach((input, index) => {
      it(`parse[${index}] - TOTP`, () => {
        const totp = new OTPAuth.TOTP({
          ...input.totp.constructor.input,
          secret: new OTPAuth.Secret({ buffer: input.buffer }),
        });

        const output = OTPAuth.URI.parse(input.totp.toString.output);
        assertEquals(output, totp);
      });
    });

    cases.forEach((input, index) => {
      it(`stringify[${index}] - HOTP`, () => {
        const hotp = new OTPAuth.HOTP({
          ...input.hotp.constructor.input,
          secret: new OTPAuth.Secret({ buffer: input.buffer }),
        });

        const output = OTPAuth.URI.stringify(hotp);
        assertEquals(output, input.hotp.toString.output);
      });
    });

    cases.forEach((input, index) => {
      it(`stringify[${index}] - TOTP`, () => {
        const totp = new OTPAuth.TOTP({
          ...input.totp.constructor.input,
          secret: new OTPAuth.Secret({ buffer: input.buffer }),
        });

        const output = OTPAuth.URI.stringify(totp);
        assertEquals(output, input.totp.toString.output);
      });
    });
  });

  /* ================================================
   * Version
   * ================================================
   */

  describe("version", () => {
    it("version", () => {
      assert(typeof OTPAuth.version === "string");
      // Semantic Versioning 2.0.0 regex (taken from: https://github.com/npm/node-semver/).
      assertMatch(
        OTPAuth.version,
        /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][a-zA-Z0-9-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][a-zA-Z0-9-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/
      );
    });
  });

  // Start tests if we were the ones who initialized Mocha.
  if (context.mochaSelfSetup) {
    mocha.run((code) => {
      if (isNode) process.exit(code);
      else if (isDeno) Deno.exit(code);
    });
  }
})();
