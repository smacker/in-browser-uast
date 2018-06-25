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

    typedef struct
    {
        Nodes *nodes;
    } filter_result;

    gopkg::in::bblfsh::sdk::v1::uast::Node node;

    void EMSCRIPTEN_KEEPALIVE free_filter(filter_result *result)
    {
        NodesFree(result->nodes);
        delete result;
        delete node;
    }

    size_t EMSCRIPTEN_KEEPALIVE get_node_size(filter_result *result, int i)
    {
        Nodes *nodes = result->nodes;

        gopkg::in::bblfsh::sdk::v1::uast::Node *n =
            (gopkg::in::bblfsh::sdk::v1::uast::Node *)NodeAt(nodes, i);

        const char *children = InternalType(n);
        return n->ByteSizeLong();
    }

    filter_result *EMSCRIPTEN_KEEPALIVE filter(void *uast, int uast_size, const char *query)
    {
        GOOGLE_PROTOBUF_VERIFY_VERSION;

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

        printf("query: %s\n", query);

        const bool ok = node.ParseFromArray(uast, uast_size);
        if (ok)
        {
            Nodes *nodes = UastFilter(ctx, &node, query);

            if (nodes == NULL)
            {
                return NULL;
            }

            filter_result result;
            filter_result *result_ptr = &result;
            result_ptr->nodes = nodes;

            return result_ptr;
        }
        else
        {
            printf("filter failed\n");
            return NULL;
        }
    }

    int EMSCRIPTEN_KEEPALIVE get_nodes_size(filter_result *result)
    {
        return NodesSize(result->nodes);
    }

    void *EMSCRIPTEN_KEEPALIVE get_node(filter_result *result, int i)
    {
        Nodes *nodes = result->nodes;
        gopkg::in::bblfsh::sdk::v1::uast::Node *n =
            (gopkg::in::bblfsh::sdk::v1::uast::Node *)NodeAt(nodes, i);
        size_t size = n->ByteSizeLong();

        void *buffer = malloc(size);
        if (buffer == NULL)
        {
            printf("can't allocate memory for buffer");
        }

        if (!n->SerializeToArray(buffer, size))
        {
            return NULL;
        }

        return buffer;
    }

#ifdef __cplusplus
}
#endif

// quick debug
// int main()
// {
//     uint8_t uast[] = {10, 4, 70, 105, 108, 101, 26, 233, 3, 10, 7, 80, 114, 111, 103, 114, 97, 109, 18, 23, 10, 12, 105, 110, 116, 101, 114, 110, 97, 108, 82, 111, 108, 101, 18, 7, 112, 114, 111, 103, 114, 97, 109, 18, 20, 10, 10, 115, 111, 117, 114, 99, 101, 84, 121, 112, 101, 18, 6, 109, 111, 100, 117, 108, 101, 26, 157, 3, 10, 19, 69, 120, 112, 114, 101, 115, 115, 105, 111, 110, 83, 116, 97, 116, 101, 109, 101, 110, 116, 18, 20, 10, 12, 105, 110, 116, 101, 114, 110, 97, 108, 82, 111, 108, 101, 18, 4, 98, 111, 100, 121, 26, 222, 2, 10, 14, 67, 97, 108, 108, 69, 120, 112, 114, 101, 115, 115, 105, 111, 110, 18, 26, 10, 12, 105, 110, 116, 101, 114, 110, 97, 108, 82, 111, 108, 101, 18, 10, 101, 120, 112, 114, 101, 115, 115, 105, 111, 110, 26, 212, 1, 10, 16, 77, 101, 109, 98, 101, 114, 69, 120, 112, 114, 101, 115, 115, 105, 111, 110, 18, 17, 10, 8, 99, 111, 109, 112, 117, 116, 101, 100, 18, 5, 102, 97, 108, 115, 101, 18, 22, 10, 12, 105, 110, 116, 101, 114, 110, 97, 108, 82, 111, 108, 101, 18, 6, 99, 97, 108, 108, 101, 101, 26, 63, 10, 10, 73, 100, 101, 110, 116, 105, 102, 105, 101, 114, 18, 22, 10, 12, 105, 110, 116, 101, 114, 110, 97, 108, 82, 111, 108, 101, 18, 6, 111, 98, 106, 101, 99, 116, 34, 7, 99, 111, 110, 115, 111, 108, 101, 42, 4, 16, 1, 24, 1, 50, 6, 8, 7, 16, 1, 24, 8, 58, 2, 18, 1, 26, 63, 10, 10, 73, 100, 101, 110, 116, 105, 102, 105, 101, 114, 18, 24, 10, 12, 105, 110, 116, 101, 114, 110, 97, 108, 82, 111, 108, 101, 18, 8, 112, 114, 111, 112, 101, 114, 116, 121, 34, 3, 108, 111, 103, 42, 6, 8, 8, 16, 1, 24, 9, 50, 6, 8, 11, 16, 1, 24, 12, 58, 2, 18, 1, 42, 4, 16, 1, 24, 1, 50, 6, 8, 11, 16, 1, 24, 12, 58, 5, 2, 18, 1, 84, 85, 26, 71, 10, 13, 83, 116, 114, 105, 110, 103, 76, 105, 116, 101, 114, 97, 108, 18, 25, 10, 12, 105, 110, 116, 101, 114, 110, 97, 108, 82, 111, 108, 101, 18, 9, 97, 114, 103, 117, 109, 101, 110, 116, 115, 34, 4, 116, 101, 115, 116, 42, 6, 8, 12, 16, 1, 24, 13, 50, 6, 8, 18, 16, 1, 24, 19, 58, 5, 18, 88, 98, 84, 49, 42, 4, 16, 1, 24, 1, 50, 6, 8, 19, 16, 1, 24, 20, 58, 2, 18, 84, 42, 4, 16, 1, 24, 1, 50, 6, 8, 20, 16, 1, 24, 21, 58, 1, 19, 42, 4, 16, 1, 24, 1, 50, 6, 8, 20, 16, 1, 24, 21, 58, 1, 57, 42, 4, 16, 1, 24, 1, 50, 6, 8, 20, 16, 1, 24, 21, 58, 1, 34};

//     filter_result *r = filter((void *)(&uast), 515, "//*");
//     printf("mytest r: %p\n", r);
//     printf("mytest r->nodes: %p\n", r->nodes);

//     size_t nsize = get_node_size(r, 1);
//     printf("mytest nsize: %zu\n", nsize);
//     printf("mytest get_node: %s\n", (char *)get_node(r, 1));

//     free_filter(r);

//     return 0;
// }