package cn.iocoder.myblog.module.blog.dal.mysql;

import cn.iocoder.myblog.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.myblog.module.blog.dal.dataobject.BlogEntities.*;
import org.apache.ibatis.annotations.Mapper;

public final class BlogMappers {
    private BlogMappers() {}
    @Mapper public interface ArticleMapper extends BaseMapperX<Article> {}
    @Mapper public interface ResourceMapper extends BaseMapperX<Resource> {}
    @Mapper public interface CategoryMapper extends BaseMapperX<Category> {}
    @Mapper public interface TagMapper extends BaseMapperX<Tag> {}
    @Mapper public interface ArticleTagMapper extends BaseMapperX<ArticleTag> {}
    @Mapper public interface SiteMapper extends BaseMapperX<Site> {}
}
