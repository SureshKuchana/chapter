import { Flex, Heading, Grid, Center } from '@chakra-ui/layout';
import { NextPage } from 'next';
import React from 'react';
import { LinkButton } from 'chakra-next-link';
import { ChapterCard } from '../../../components/ChapterCard';
import { useChaptersQuery } from '../../../generated/graphql';
import { Loading } from '../../../components/Loading';
import { useAuth } from '../../../modules/auth/store';

export const ChaptersPage: NextPage = () => {
  const { loading, error, data } = useChaptersQuery();
  const { isLoggedIn } = useAuth();
  const isLoading = loading || !data;
  if (isLoading || error) return <Loading loading={isLoading} error={error} />;

  return (
    <Center>
      <Grid
        gap="1em"
        w={{ base: '90%', '2xl': '60%' }}
        maxW="48em"
        mt={10}
        mb={5}
        placeItems={'center'}
      >
        <Flex
          justifyContent={'space-between'}
          alignItems={'center'}
          width={'100%'}
        >
          <Heading marginBlock={'1em'}>Chapters: </Heading>
          {isLoggedIn && (
            <LinkButton href="/dashboard/chapters" colorScheme={'blue'}>
              Chapter Dashboard
            </LinkButton>
          )}
        </Flex>
        {data.chapters.map((chapter) => (
          <ChapterCard chapter={chapter} key={chapter.id} />
        ))}
      </Grid>
    </Center>
  );
};
