#include <cstdint>

#include <iostream>
#include <string>
#include <tuple>
#include <vector>

#include "uast.h"
#include "uast.pb.h"

#include "emscripten.h"

static Uast *ctx;

static const char *InternalType(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)
        ->internal_type()
        .c_str();
}

static const char *Token(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)->token().c_str();
}

static size_t ChildrenSize(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)->children_size();
}

static void *ChildAt(const void *node, int index)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)
        ->mutable_children(index);
}

static size_t RolesSize(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)->roles_size();
}

static uint16_t RoleAt(const void *node, int index)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)->roles(index);
}

static size_t PropertiesSize(const void *node)
{
    // FIXME
    // return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)->properties_size();
    return 0;
}

static const char *PropertyKeyAt(const void *node, int index)
{
    // FIXME
    // iterate, get keys, sort, index
    // return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)->properties();
    return NULL;
}

static const char *PropertyValueAt(const void *node, int index)
{
    // FIXME
    // iterate, get keys, sort, index -> key -> value
    // return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)->properties();
    return NULL;
}

static bool HasStartOffset(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)->has_start_position();
}

static uint32_t StartOffset(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)
        ->start_position()
        .offset();
}

static bool HasStartLine(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)->has_start_position();
}

static uint32_t StartLine(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)
        ->start_position()
        .line();
}

static bool HasStartCol(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)->has_start_position();
}

static uint32_t StartCol(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)
        ->start_position()
        .col();
}

static bool HasEndOffset(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)->has_end_position();
}

static uint32_t EndOffset(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)
        ->end_position()
        .offset();
}

static bool HasEndLine(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)->has_end_position();
}

static uint32_t EndLine(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)
        ->end_position()
        .line();
}

static bool HasEndCol(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)->has_end_position();
}

static uint32_t EndCol(const void *node)
{
    return ((gopkg::in::bblfsh::sdk::v1::uast::Node *)node)->end_position().col();
}

//

#ifdef __cplusplus
extern "C"
{
#endif

    int EMSCRIPTEN_KEEPALIVE filter(int uast[], int uast_size, const char *query)
    {
        GOOGLE_PROTOBUF_VERIFY_VERSION;

        printf("query: %s\n", query);
        // printf(query);

        gopkg::in::bblfsh::sdk::v1::uast::Node node;
        const bool ok = node.ParseFromArray(uast, uast_size);
        if (ok)
        {
            Uast *ctx = UastNew(NodeIface{
                .InternalType = InternalType,
                .Token = Token,
                .ChildrenSize = ChildrenSize,
                .ChildAt = ChildAt,
                .RolesSize = RolesSize,
                .RoleAt = RoleAt,
                .PropertiesSize = PropertiesSize,
                .PropertyKeyAt = PropertyKeyAt,
                .PropertyValueAt = PropertyValueAt,
                .HasStartOffset = HasStartOffset,
                .StartOffset = StartOffset,
                .HasStartLine = HasStartLine,
                .StartLine = StartLine,
                .HasStartCol = HasStartCol,
                .StartCol = StartCol,
                .HasEndOffset = HasEndOffset,
                .EndOffset = EndOffset,
                .HasEndLine = HasEndLine,
                .EndLine = EndLine,
                .HasEndCol = HasEndCol,
                .EndCol = EndCol,
            });

            Nodes *nodes = UastFilter(ctx, &node, query);

            if (nodes == NULL)
            {
                return 0;
            }

            gopkg::in::bblfsh::sdk::v1::uast::Node *n =
                (gopkg::in::bblfsh::sdk::v1::uast::Node *)NodeAt(nodes, 0);
            size_t size = n->ByteSizeLong();
            void *buffer = malloc(size);
            if (!n->SerializeToArray(buffer, n->ByteSizeLong()))
            {
                return 0;
            }
            printf("f: %s\n", (char *)buffer);

            int nodesN = NodesSize(nodes);

            NodesFree(nodes);
            UastFree(ctx);

            return nodesN;
        }
        else
        {
            // return error somehow
            return -1;
        }
    }

#ifdef __cplusplus
}
#endif
